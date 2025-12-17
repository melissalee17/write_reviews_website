import Form from 'react-bootstrap/Form';

export default function SwitchField(
    {name, label, checked, fieldRef}
) {
    return (
        <Form.Group controlId={name} className="SwitchField">
            {label && <Form.Label>{label}</Form.Label>}
            <Form.Check 
                type="switch"
                ref={fieldRef}
                checked={checked}
            />
        </Form.Group>
    );
}