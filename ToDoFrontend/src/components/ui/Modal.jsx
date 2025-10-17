import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export default function Modal({ title, onClose, children, footer }) {
  const node = (
    <div className="modalBackground" role="dialog" aria-modal="true">
      <div className="modalContainer">
        <div className="titleCloseBtn">
          <button aria-label="Close" onClick={onClose}>×</button>
        </div>
        {title && <div className="modalTitle">{title}</div>}
        <div className="modalBody">{children}</div>
        {footer && <div className="footer">{footer}</div>}
      </div>
    </div>
  );
  return ReactDOM.createPortal(node, document.body);
}
