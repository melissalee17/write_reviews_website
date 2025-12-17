import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Header from './components/Header';
import WriteReviewPage from './pages/WriteReviewPage';
import HomePage from './pages/HomePage';
import FindReviewPage from './pages/FindReviewPage';
import UpdateReviewPage from './pages/UpdateReviewPage';
import FlashProvider from './contexts/FlashProvider';
import ApiProvider from './contexts/ApiProvider';

export default function App() {
  return (
    <Container fluid className="App">
       <BrowserRouter>
        <FlashProvider>
          <ApiProvider>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/write-review" element={<WriteReviewPage />} />
              <Route path="/find-review" element={<FindReviewPage />} />
              <Route path="/update-review/:restaurant" element={<UpdateReviewPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ApiProvider>
        </FlashProvider>
       </BrowserRouter>
    </Container>
  );
}