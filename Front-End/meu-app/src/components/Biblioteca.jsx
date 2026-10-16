import { EmptyState } from './Feedback';
function documentUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
export default function Biblioteca({ items, video = false }) {
  if (!items.length) return <EmptyState title={video ? 'Nenhum vídeo disponível' : 'Nenhum documento disponível'} icon={video ? 'bi-play-circle' : 'bi-journal-text'}>
    {video ? 'Os vídeos de treinamento serão disponibilizados aqui.' : 'Os procedimentos e orientações serão disponibilizados aqui em PDF.'}
  </EmptyState>;
  return <div className="row g-3">{items.map((item) => {
    const videoId = video && /^[a-zA-Z0-9_-]{11}$/.test(item.youtubeId || '') ? item.youtubeId : null;
    const url = video ? (videoId ? 'https://www.youtube.com/watch?v=' + videoId : null) : documentUrl(item.url);
    return <div key={item.id} className="col-12 col-md-6 col-xl-4"><article className="card h-100 border-0 shadow-sm">
      {videoId && <img src={'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg'} alt="" className="card-img-top" loading="lazy" />}
      <div className="card-body"><h2 className="h5 text-break">{item.titulo}</h2>{item.descricao && <p className="text-muted">{item.descricao}</p>}
        {url ? <div className="d-flex flex-wrap gap-2">
          <a className="btn btn-outline-success" href={url} target="_blank" rel="noopener noreferrer">{video ? 'Assistir no YouTube' : 'Abrir PDF'}</a>
          {!video && <a className="btn btn-verde" href={url} download target="_blank" rel="noopener noreferrer">Baixar PDF</a>}
        </div> : <span className="text-muted">Material indisponível</span>}
      </div>
    </article></div>;
  })}</div>;
}
