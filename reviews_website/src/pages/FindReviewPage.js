import { useState} from 'react';
import Form from 'react-bootstrap/Form';
import Body from '../components/Body';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useApi } from '../contexts/ApiProvider';
import ResultCard from '../components/ResultCard';

export default function WriteReviewPage() {
  const [results, setResults] = useState([]);
  const api = useApi();


  const typingResults = async (event) => {
    const response = await api.get('/find-review', {"name": event.target.value}, {headers: {'Content-Type': 'application/json'}});
    if (response) {
      setResults(response.body.results);
    }
  };

  return (
    <Body>
      <h1>Search For Review</h1>
      <Form>
        <Row>
          <Col xs={7}>
            <Form.Group controlId="restaurantName" className="InputField">
              {<Form.Label>Restaurant Name</Form.Label>}
              <Form.Control
                type='text'
                placeholder="Search Restaurant Name"
                onChange={e => {typingResults(e)}}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      {results.length === 0 ?
        <p>There are no results.</p>
      :
        results.map(result => 
          <ResultCard key={result.name} 
          name={result.name} 
          description={result.description}
          city={result.city}
          state={result.state}
          url={"/update-review/" + result.name}/>)
      }
    </Body>
  );
}