import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';

export function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111a33',
            color: '#f3f6ff',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
