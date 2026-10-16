import { useEffect, useState } from 'react';
export default function useResource(loader) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    // A troca de recurso precisa invalidar os dados antes da resposta assíncrona.
    // eslint-disable-next-line react/set-state-in-effect
    setState({ data: null, loading: true, error: null });
    loader(controller.signal).then(
      (data) => { if (!controller.signal.aborted) setState({ data, loading: false, error: null }); },
      (error) => { if (!controller.signal.aborted) setState({ data: null, loading: false, error }); },
    );
    return () => controller.abort();
  }, [loader, revision]);
  return { ...state, reload: () => setRevision((value) => value + 1) };
}
