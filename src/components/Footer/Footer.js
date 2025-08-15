import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} 포토씽킹 (PhotoThinking). All rights reserved.</p>
        <p>본 서비스는 AI를 활용한 창의력 증진 및 인지 건강 지원 플랫폼입니다.</p>
      </div>
    </footer>
  );
}

export default Footer; 