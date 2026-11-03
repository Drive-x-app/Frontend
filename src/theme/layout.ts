export const CUSTOMER_DESKTOP_BREAKPOINT = 960;

export function isCustomerDesktop(width: number): boolean {
  return width >= CUSTOMER_DESKTOP_BREAKPOINT;
}
