import { useRouter } from 'next/router';
import ColaboradorForm from '../../../components/ColaboradorForm';

export default function EditarColaboradorPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return <ColaboradorForm mode="edit" colaboradorId={id} />;
}