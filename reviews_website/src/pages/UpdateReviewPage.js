import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Body from '../components/Body';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import InputField from '../components/InputField';
import SwitchField from '../components/SwitchField';
import { useApi } from '../contexts/ApiProvider';
import { useNavigate } from 'react-router-dom';
import { useFlash } from '../contexts/FlashProvider';
import FileUpload from '../components/FileUpload';

export default function UpdateReviewPage() {
  const { restaurant } = useParams();
  const restaurantNameField = useRef();
  const websiteField = useRef();
  const addressField = useRef();
  const cityField = useRef();
  const stateField = useRef();
  const zipcodeField = useRef();
  const descriptionField = useRef();
  const visitingFrequencyField = useRef();
  const tagsField = useRef();
  const openLateField = useRef();
  const openEarlyField = useRef();
  const haveIBeenField = useRef();
  const reservationNeededField = useRef();
  const goodDrinksField = useRef();
  const goodDessertsField = useRef();
  const studySpotField = useRef();
  const vegetarianFriendlyField = useRef();
  const lactoseIntoleranceFriendlyField = useRef();
  const quickField = useRef();
  const lunchSpotField = useRef();
  const orderOnlineField = useRef();
  const priceRangeField = useRef();
  const dressAttireField = useRef();
  const opinionField = useRef();
  const navigate = useNavigate();
  const api = useApi();
  const flash = useFlash();
  const [key, setKey] = useState();
  const [Photos, setPhotos] = useState([]);
  const [photoLinks, setPhotoLinks] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await api.get('/update-review/' + restaurant);
      if (response.ok) {
        const review = response.body.review;
        setKey(review.Restaurant.restaurant_key);
        restaurantNameField.current.value = review.Restaurant.name;
        websiteField.current.value = review.Restaurant.website;
        descriptionField.current.value = review.Restaurant.description;
        visitingFrequencyField.current.value = review.Restaurant.visiting_frequency;
        tagsField.current.value = review.Restaurant.tags;
        openLateField.current.checked = review.Restaurant.open_late;
        openEarlyField.current.checked = review.Restaurant.open_early;
        haveIBeenField.current.checked = review.Restaurant.have_i_been;
        reservationNeededField.current.checked = review.Restaurant.need_reservation;
        goodDrinksField.current.checked = review.Restaurant.good_drinks;
        goodDessertsField.current.checked = review.Restaurant.good_desserts;
        studySpotField.current.checked = review.Restaurant.study_spot;
        vegetarianFriendlyField.current.checked = review.Restaurant.veg_friendly;
        lactoseIntoleranceFriendlyField.current.checked = review.Restaurant.dairy_free_items;
        quickField.current.checked = review.Restaurant.quick;
        lunchSpotField.current.checked = review.Restaurant.lunch_spot;
        orderOnlineField.current.checked = review.Restaurant.order_online;
        priceRangeField.current.value = review.Restaurant.price;
        dressAttireField.current.value = review.Restaurant.dress_attire;
        opinionField.current.value = review.Restaurant.opinion;
        addressField.current.value = review.Location.address;
        cityField.current.value = review.Location.city;
        stateField.current.value = review.Location.state;
        zipcodeField.current.value = review.Location.zipcode;
        setPhotoLinks(response.body.photos.map(photo => photo.file_link));
        flash("Review Found!", 'success');
      }
      else{
        navigate('/');
      }

    })();
  }, [restaurant, api]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (restaurantNameField.current.value === "") {
        flash("No restaurant name given", "danger");
    }
    else {
        const restaurantData = {
            name: restaurantNameField.current.value,
            restaurant_key: key,
            website: websiteField.current.value === "" ? null : websiteField.current.value,
            description: descriptionField.current.value,
            visiting_frequency: visitingFrequencyField.current.value,
            tags: tagsField.current.value,
            open_late: openLateField.current.checked,
            open_early: openEarlyField.current.checked,
            have_i_been: haveIBeenField.current.checked,
            need_reservation: reservationNeededField.current.checked,
            good_drinks: goodDrinksField.current.checked,
            good_desserts: goodDessertsField.current.checked,
            study_spot: studySpotField.current.checked,
            veg_friendly: vegetarianFriendlyField.current.checked,
            dairy_free_items: lactoseIntoleranceFriendlyField.current.checked,
            quick: quickField.current.checked,
            lunch_spot: lunchSpotField.current.checked,
            order_online: orderOnlineField.current.checked,
            price: priceRangeField.current.value,
            dress_attire: dressAttireField.current.value,
            opinion: opinionField.current.value
        };
        const locationData = {
            address: addressField.current.value,
            city: cityField.current.value,
            state: stateField.current.value,
            zipcode: zipcodeField.current.value === "" ? null : zipcodeField.current.value
        };

        if (Photos.length === 0){
            let sendData = {
                Restaurant: restaurantData,
                Location: locationData
            };
            const data = await api.put('/update-review/' + restaurantNameField.current.value, JSON.stringify(sendData), {headers: {'Content-Type': 'application/json'}});
            if (data.ok) {
                const message = restaurantNameField.current.value + " has been updated!";
                flash(message, 'success');
                navigate('/');
            }
            else {
                flash(JSON.stringify(data.body), 'danger');
            }
        }
        else {
            const formData = new FormData();
            formData.append('Restaurant', JSON.stringify(restaurantData));
            formData.append('Location', JSON.stringify(locationData));
            Photos.forEach(photo => formData.append('file', photo));
            const data = await api.put('/update-review/' + restaurantNameField.current.value, formData);
            if (data.ok) {
                const message = restaurantNameField.current.value + " has been updated!";
                flash(message, 'success');
                navigate('/');
            }
            else {
                flash(JSON.stringify(data.body), 'danger');
            }
        }
    }
  };
return (
    <Body>
      <h1>Update Review</h1>
      <Form onSubmit={onSubmit}>
        <Row>
            <Col>
                <InputField
                name="restaurantName" label="Restaurant Name" 
                fieldRef={restaurantNameField}/>
            </Col>
            <Col>
                <InputField
                name="website" label="Webite"  type="url"
                fieldRef={websiteField}/>
            </Col>
        </Row>
        <InputField 
        name="address" label="Address"
        fieldRef={addressField}/>
        <Row>
            <Col xs={6}>
                <InputField 
                name="city" label="City"
                fieldRef={cityField}/>
            </Col>
            <Col>
                <Form.Group controlId="state" className="Select">
                    <Form.Label>State</Form.Label>
                    <Form.Select ref={stateField}>
                        <option value="Texas">Texas</option>
                        <option value="California">California</option>
                        <option value="New York">New York</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col>
                <InputField 
                name="zipcode" label="Zipcode" type="number"
                fieldRef={zipcodeField}
                />
            </Col>
        </Row>
        <Row>
            <Col>
                <InputField 
                name="whatTheyDo" label="What They Do"
                fieldRef={descriptionField}/>
            </Col>
            <Col>
                <InputField 
                name="howOftenIGo" label="How Often I Go"
                fieldRef={visitingFrequencyField}
                />
            </Col>
        </Row>
        <InputField 
        name="tags" label="Tags"
        fieldRef={tagsField}
        />
        <Row>
            <Col>
                <SwitchField 
                name="openLate" label="Open Late"
                fieldRef={openLateField}/>
            </Col>
            <Col>
                <SwitchField 
                name="openEarly" label="Open Early"
                fieldRef={openEarlyField}
                />
            </Col>
            <Col>
                <SwitchField 
                name="haveIBeen" label="Have I Been"
                fieldRef={haveIBeenField}/>
            </Col>
            <Col>
                <SwitchField 
                name="reservationNeeded" label="Reservation Needed"
                fieldRef={reservationNeededField}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <SwitchField 
                name="goodDrinks" label="Good Drinks"
                fieldRef={goodDrinksField}/>
            </Col>
            <Col>
                <SwitchField 
                name="goodDesserts" label="Good Desserts"
                fieldRef={goodDessertsField}/>
            </Col>
            <Col>
                <SwitchField 
                name="studySpot" label="Study Spot"
                fieldRef={studySpotField}/>
            </Col>
            <Col>
                <SwitchField 
                name="vegetarianFriendly" label="Vegetarian Friendly"
                fieldRef={vegetarianFriendlyField}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <SwitchField 
                name="lactoseIntoleranceFriendly" label="Lactose Intolerance Friendly"
                fieldRef={lactoseIntoleranceFriendlyField}/>
            </Col>
            <Col>
                <SwitchField 
                name="quick" label="Quick"
                fieldRef={quickField}/>
            </Col>
            <Col>
                <SwitchField 
                name="lunchSpot" label="Lunch Spot"
                fieldRef={lunchSpotField}/>
            </Col>
            <Col>
                <SwitchField 
                name="orderOnline" label="Order Online"
                fieldRef={orderOnlineField}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <Form.Group controlId="priceRange" className="Select">
                    <Form.Label>Price Range</Form.Label>
                    <Form.Select ref={priceRangeField}>
                        <option value="$0-10">$0-10</option>
                        <option value="$10-20">$10-20</option>
                        <option value="$20-30">$20-30</option>
                        <option value="$30-50">$30-50</option>
                        <option value="$50-100">$50-100</option>
                        <option value="$100+">$100+</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col>
                <Form.Group controlId="dressAttire" className="Select">
                    <Form.Label>Dress Attire</Form.Label>
                    <Form.Select ref={dressAttireField}>
                        <option value="casual">Casual</option>
                        <option value="somewhat formal">Somewhat Formal</option>
                        <option value="formal">Formal</option>
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>
        <Form.Group className="mb-3" controlId="opinion">
            <Form.Label>My Opinion</Form.Label>
            <Form.Control as="textarea" rows={5} spellCheck="true" ref={opinionField} />
        </Form.Group>
        {photoLinks.length !== 0 ? <h4>Photos Already Uploaded:</h4> : null}
        {photoLinks.map(photo => <img key={photo} src={photo} width="500"/>)}
        <FileUpload files={Photos} setFiles={setPhotos}/> 
        <Button variant="primary" type="submit">Update</Button>
      </Form>
    </Body>
  );
}