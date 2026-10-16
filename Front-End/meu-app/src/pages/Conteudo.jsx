import Biblioteca from '../components/Biblioteca';
import { PageTitle } from '../components/Feedback';
import { videos } from '../data/materiais';
export default function Conteudo() {
  return <><PageTitle title="Conteúdo educativo">Vídeos para apoiar o uso do sistema e o treinamento da equipe.</PageTitle><Biblioteca items={videos} video /></>;
}
