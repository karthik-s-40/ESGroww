const mockBack = jest.fn();
let mockPathname = "/dashboard";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => mockPathname,
}));

import BackButton from "@/components/BackButton";
import { fireEvent, renderWithProviders, screen, waitFor } from "../../utils/render";

describe("BackButton", () => {
  test("renders after mount and navigates back on click", async () => {
    mockPathname = "/dashboard";

    renderWithProviders(<BackButton />);

    const button = await waitFor(() => screen.getByLabelText("Go back"));
    fireEvent.click(button);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test("remains hidden on excluded routes", async () => {
    mockPathname = "/login";

    renderWithProviders(<BackButton />);

    await waitFor(() => {
      expect(screen.queryByLabelText("Go back")).not.toBeInTheDocument();
    });
  });
});