import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FieldReviewCell } from "./FieldReviewCell";

const { useQuery } = vi.hoisted(() => ({ useQuery: vi.fn() }));

vi.mock("@/src/utils/api", () => ({
  api: { events: { listCursor: { useQuery } } },
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("FieldReviewCell", () => {
  it("shows one link for the latest evidence observation using its trace ID", () => {
    useQuery.mockReturnValue({
      isFetching: false,
      data: { observations: [{ id: "latest-observation" }] },
    });
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <FieldReviewCell
          projectId="project-1"
          traceId="trace/1"
          observationId="older-observation"
        />
        <FieldReviewCell
          projectId="project-1"
          traceId="trace/1"
          observationId="latest-observation"
        />
      </div>,
    );

    const link = screen.getByRole("link", { name: "View Field Review" });
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(link.getAttribute("href")).toBe(
      "/project/project-1/field-review?traceId=trace%2F1",
    );
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(useQuery).toHaveBeenCalledWith({
      projectId: "project-1",
      searchQuery: null,
      searchType: ["id", "content"],
      filter: [
        {
          column: "name",
          type: "string",
          operator: "=",
          value: "allied_health_evaluation_evidence",
        },
        { column: "traceId", type: "string", operator: "=", value: "trace/1" },
      ],
      limit: 1,
    });
  });

  it("keeps the cell empty while the latest result is being refreshed", () => {
    useQuery.mockReturnValue({
      isFetching: true,
      data: { observations: [{ id: "older-observation" }] },
    });
    render(
      <FieldReviewCell
        projectId="project-1"
        traceId="trace-1"
        observationId="older-observation"
      />,
    );

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("does not show stale results after a failed refresh", () => {
    useQuery.mockReturnValue({
      isFetching: false,
      isError: true,
      data: { observations: [{ id: "older-observation" }] },
    });
    render(
      <FieldReviewCell
        projectId="project-1"
        traceId="trace-1"
        observationId="older-observation"
      />,
    );

    expect(screen.queryByRole("link")).toBeNull();
  });
});
