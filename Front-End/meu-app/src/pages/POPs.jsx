import Biblioteca from '../components/Biblioteca';
import { PageTitle } from '../components/Feedback';
import { documentos } from '../data/materiais';
export default function POPs() {
  return <><PageTitle title="POPs">Procedimentos operacionais, orientações e documentos internos.</PageTitle><Biblioteca items={documentos} /></>;
}
