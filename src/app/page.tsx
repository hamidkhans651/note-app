import UrlForm from '@/components/UrlForm';
import ImportUrls from '../components/ImportUrls';


export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the Facebook Group URL Manager</h1>
      <UrlForm />
      <ImportUrls />

    </div>
  );
}