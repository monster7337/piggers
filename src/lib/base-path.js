const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function isExternalPath(path) {
  return /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("tel:") || path.startsWith("mailto:");
}

export function withBasePath(path = "") {
  if (!path || !BASE_PATH || isExternalPath(path) || path.startsWith("#")) {
    return path;
  }

  return path.startsWith("/") ? `${BASE_PATH}${path}` : `${BASE_PATH}/${path}`;
}

export function stripBasePath(pathname = "") {
  if (!pathname || !BASE_PATH) {
    return pathname || "";
  }

  if (pathname === BASE_PATH) {
    return "/";
  }

  return pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname;
}

export function getPublicBasePath() {
  return BASE_PATH;
}
