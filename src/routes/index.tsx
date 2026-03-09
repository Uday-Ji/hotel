import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routeConfig';

const router = createBrowserRouter(routes);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
