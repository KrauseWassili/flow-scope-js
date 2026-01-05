import React, { useState } from "react";

type ControlAreaProps = {
    onSend: () => void;
}

export default function ControlArea({onSend}: ControlAreaProps) {
  
  return (
    <div>
      <h2>Control area</h2>

      <h3>Messenger (coming soon)</h3>
      <button onClick={onSend}>Send message</button>
      <h3>Login (coming soon)</h3>
      <h3>Register (coming soon)</h3>
    </div>
  );
}
