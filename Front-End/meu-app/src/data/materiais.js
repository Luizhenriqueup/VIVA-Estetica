// Catálogos locais de apresentação.
// Não são respostas da API e não contêm mocks. Ao existir um contrato, adaptar
// seus dados ao componente Biblioteca, sem presumir campos do backend.
// POP local: { id, titulo, descricao?, url }.
// Vídeo local: { id, titulo, descricao?, youtubeId }.
export const documentos = [
  {
    id: 'pdf-de-teste',
    titulo: 'PDF de teste',
    descricao: 'Documento para aprendizado',
    url: '/pdfs/pdf-de-teste.pdf',
  },
  {
    id: 'pdf-de-teste-copyy',
    titulo: 'PDF de teste Copia',
    descricao: 'Documento de teste',
    url: '/pdfs/pdf-de-teste-copy.pdf',
  },
];
export const videos = [
  {
    id: 'video',
    titulo: 'Video De Teste',
    descricao: 'video de educação',
    youtubeId: 'uQK3SroAziw',
  }
];
