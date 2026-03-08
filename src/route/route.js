
import Login from '../admin/pages/Login';
import Register from '../admin/pages/Register';
import { appRoutes } from '../constant/constant';
import ChangePassWord from '../global/components/changePassWord';


const defaulRoutes = [
    {
        path: '/',
        element: <Login />,
        index:true
  },
  {
    path: '/login',
    element: <Login />,
    index:true
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path:appRoutes.changePassWord,
    element:<ChangePassWord/>
  },
  {
    path: '*',
    element: <Login/>,
  },
];

export default defaulRoutes;
