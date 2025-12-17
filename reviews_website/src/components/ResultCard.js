import { CardGroup } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';


    export default function ResultCard(
        {name, description, city, state, url}
    ) 
    {
        return (
            <CardGroup className="ResultCard" id={name}>
                <Card>
                    <Card.Header>{name} </Card.Header>
                    <Card.Body>
                        <Card.Subtitle>{city},{state}</Card.Subtitle>
                        <Card.Subtitle>Description: {description}</Card.Subtitle>
                        <a href={url} className="stretched-link"></a>
                    </Card.Body>
                </Card>
            </CardGroup>
        );
    }