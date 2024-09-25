declare module '@uiw/react-md-editor' {
  import React from 'react';
  
  interface MDEditorProps {
    value?: string;
    onChange?: (value?: string) => void;
    height?: number;
  }

  const MDEditor: React.FC<MDEditorProps>;
  export default MDEditor;
}