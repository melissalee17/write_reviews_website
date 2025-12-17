import Figure from 'react-bootstrap/Figure';
import {useEffect} from 'react';
import {useDropzone} from 'react-dropzone';

function returnFileSize(number) {
  if (number < 1e3) {
    return `${number} bytes`;
  } else if (number >= 1e3 && number < 1e6) {
    return `${(number / 1e3).toFixed(1)} KB`;
  }
  return `${(number / 1e6).toFixed(1)} MB`;
}

export default function FileUpload({files, setFiles}) {
  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'image/jpg': [],
      'image/png': []
    },
    maxFiles: 5,
    maxSize: 10 * 1000 * 1000,
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });
  
  const thumbs = files.map(file => (
    <Figure>
        <Figure.Caption>
            {file.path} - {returnFileSize(file.size)} bytes
        </Figure.Caption>
        <Figure.Image
            src={file.preview}
            // Revoke data uri after image is loaded
            onLoad={() => { URL.revokeObjectURL(file.preview) }}
        />
    </Figure>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <section className="FileUpload">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag and drop some files here, or click to select files</p>
      </div>
      <aside>
        {thumbs}
      </aside>
    </section>
  );
}