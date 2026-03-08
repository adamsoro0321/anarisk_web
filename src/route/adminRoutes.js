import Home from '../admin/pages/Home';
import HomeDashbord from '../admin/components/HomeDashbord';
import Agent from '../admin/components/Agent';
import ListAdminAssurance from '../admin/components/adminassurance/AdminAssurance';


import { appRoutes } from '../constant/constant';
import Laboratoire from '../admin/components/Laboratoire';
import MedecinConseille from '../admin/components/medecinconseille/MedecinConseille';
import Partenaire from '../admin/components/Partenaire';
import Pharmacy from '../admin/components/Pharmacy';
import Police from '../admin/components/Police';
import Assure from '../admin/components/Assure';
import RegisterAssure from '../admin/components/forms/RegisterAssure';
import ProfilAssure from '../admin/components/profiles/Assureprofile';
import RegisterPartenaire from '../admin/components/forms/RegisterPartenaire';

import OperationMedical from '../admin/components/OperationMedicales';

import RegisterOffre from '../admin/components/forms/RegisterOffre';
import RegisterCategorie from '../admin/components/forms/RegisterCategorie';
import RegisterMaladie from '../admin/components/forms/RegisterMaladie';
import ProfilePolice from '../admin/components/profiles/ProfilePolice';
import Structureprofile from '../admin/components/profiles/Structureprofile';
import Clinique from '../admin/components/clinique/Clinique';
import RegisterAgentAssurance from '../admin/components/forms/RegisterAgentAssurance';
import ProfilePrescription from '../admin/components/profiles/ProfilPrescriptiont';
import RegisterPoliceAssurance from '../admin/components/forms/RegisterPoliceAssurance';
import RegisterOPeration from '../admin/components/forms/RegisterOperation';
import Structure from '../admin/components/Structure';
import RegisterStructure from '../admin/components/forms/RegisterStructure';
import ProfilStructure from '../admin/components/profiles/ProfilStructure';
import NotFoundPage from '../global/NotFoundPage';
import ProfilAgent from '../admin/components/profilAgent';
import Module from '../admin/components/Module';

const adminRoutes = [
 {
  path: "",
  element: <Home/> ,
  children: [
    {
      path:'',
      element:<HomeDashbord />,
    },
    {
      path:appRoutes.home,
      element:<HomeDashbord />,
      
    },
   
    {
      path: appRoutes.Agent,
      element: <Agent />,
    },

    {
      path: appRoutes.adminAdmin,
      element: <ListAdminAssurance />,
    },

    {
      path: appRoutes.adminLaboratoire,
      element: <Laboratoire  />,
    },
    {
      path: appRoutes.adminMedecinConseil,
      element: <MedecinConseille />,
     
    },
    {
      path: appRoutes.adminParenaire,
      element: <Partenaire />,
    },
    {
      path: appRoutes.adminPharmacy,
      element: <Pharmacy />,
    },
  
    {
      path: appRoutes.adminPolice,
      element: <Police />,
    },
    {
      path: appRoutes.adminAssure,
      element: <Assure/>,
    },
    {
      path:appRoutes.clinique,
      element:<Clinique />
    },{
      path:appRoutes.register_assure,
      element:<RegisterAssure/>
    },
    {
      path:appRoutes.profile_assure,
      element:<ProfilAssure />
    },
    {
      path:appRoutes.register_partenaire,
      element:<RegisterPartenaire />
    },
  
  
    {
      path:appRoutes.operation_medical ,
      element:<OperationMedical />
    },
  
    {
      path:appRoutes.register_offre ,
      element:<RegisterOffre />
    },
    {
      path:appRoutes.register_categorie,
      element:<RegisterCategorie />
    },
    {
      path:appRoutes.register_maladie,
      element:<RegisterMaladie />
    },
    {
      path:appRoutes.profile_assure,
      element:<ProfilAssure />
    },
    {
      path:appRoutes.profile_police,
      element:<ProfilePolice />
    },
    {
      path:appRoutes.strucuture_profile,
      element:<Structureprofile />
    },
    {
      path:appRoutes.register_agent,
      element:<RegisterAgentAssurance />
    },
    {
      path:appRoutes.profile_prescription,
      element:<ProfilePrescription />
    },
    {
      path:appRoutes.register_police,
      element:<RegisterPoliceAssurance />
    },
    {
      path:appRoutes.register_operations,
      element:<RegisterOPeration />
    },
    {
      path:appRoutes.structure,
      element:<Structure/>
    },
    {
      path:appRoutes.register_structure,
      element:<RegisterStructure/>
    },
    {
      path:appRoutes.profile_structure,
      element:<ProfilStructure/>
    },
    {
      path:appRoutes.profile_agent,
      element:<ProfilAgent/>
    },
    {
      path:appRoutes.module,
      element:<Module/>
    },
    {
        path: '*',
        element: <NotFoundPage />,
      },
    
  ],
},
];

export default adminRoutes;
