import Footer from "../components/Footer/Footer.Component";
// component
import Navbar from "../components/Navbar/Navbar.Component";
import { Helmet } from "react-helmet";

const DefaultlayoutHoc =
  (Component) =>
  ({ ...props }) => {
    return (
      <div className="bg-darkBackground-900 min-h-screen">
        <Helmet>
          <title>TEDx GGSIPU | SANGAM - Ideas, Perspectives, Voices</title>
          <meta name="description" content="Official Portal for TEDx GGSIPU EDC Event - SANGAM. Join the confluence of ideas." />
        </Helmet>
        <Navbar />
        <Component {...props} />
        <Footer />
      </div>
    );
  };

export default DefaultlayoutHoc;
