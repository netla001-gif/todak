export function durationsFromRoutes(routes = []) {
  return Object.fromEntries(routes.filter((route) => route.result_code === 0 && route.summary?.duration).map((route) => [route.key, Math.max(1, Math.ceil(route.summary.duration / 60))]));
}
