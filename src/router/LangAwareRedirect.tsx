import { Navigate } from 'react-router-dom';

import { useLang } from '@/hooks/useLang';
import { homeUrl } from './paths';

/**
 * `/` rotasında: kullanıcının tarayıcı/storage diline göre `/:lang`'e
 * redirect. i18n önceden init olmuş olduğundan useLang anlık olarak
 * doğru dili döner.
 */
export default function LangAwareRedirect() {
  const { lang } = useLang();
  return <Navigate to={homeUrl(lang)} replace />;
}
