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
          <title>BACKSTAGE | Premium Event Experiences</title>
          <meta name="description" content="Official platform for premium event experiences. Book tickets and manage entries seamlessly." />
        </Helmet>
        <Navbar />
        <Component {...props} />
        <Footer />
      </div>
    );
  };

export default DefaultlayoutHoc;
