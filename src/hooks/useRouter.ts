import { useState, useEffect } from "react";

export function useRouter() {
  const [route, setRoute] = useState(() => {
    return window.location.pathname || "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setRoute(path);
  };

  return { route, navigate };
}

