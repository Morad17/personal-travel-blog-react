import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/Home/HomePage";
import CountriesPage from "./pages/Blogs/CountriesPage";
import CountryDetailPage from "./pages/Blogs/CountryDetailPage";
import PostDetailPage from "./pages/PostDetail/PostDetailPage";
import MapPage from "./pages/Map/MapPage";
import GalleryPage from "./pages/Gallery/GalleryPage";
import AdminPage from "./pages/Admin/AdminPage";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const isMapPage = location.pathname === "/map";

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <HomePage />
              </AnimatedPage>
            }
          />
          <Route
            path="/blogs"
            element={
              <AnimatedPage>
                <CountriesPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/countries/:slug"
            element={
              <AnimatedPage>
                <CountryDetailPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/countries/:countrySlug/:slug"
            element={
              <AnimatedPage>
                <PostDetailPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/map"
            element={
              <AnimatedPage>
                <MapPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/gallery"
            element={
              <AnimatedPage>
                <GalleryPage />
              </AnimatedPage>
            }
          />
          {/* <Route
            path="/contact"
            element={
              <AnimatedPage>
                <ContactPage />
              </AnimatedPage>
            }
          /> */}
          <Route
            path="/admin"
            element={
              <AnimatedPage>
                <AdminPage />
              </AnimatedPage>
            }
          />
        </Routes>
      </AnimatePresence>
      {!isMapPage && <Footer />}
    </>
  );
}
