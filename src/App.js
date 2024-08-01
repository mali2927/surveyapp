import React from 'react';
import DragAndDrop from '../src/Components/DragAndDrop';
import Login from '../src/Components/Login';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../src/Components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/DragAndDrop" element={<PrivateRoute element={<DragAndDrop />} />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
