from reviews_website_api.app import app, db
from flask import request, current_app, abort, send_from_directory
from reviews_website_api.schema import Review_Schema, Restaurant_Schema, Location_Schema, Restaurant_Name_List_Schema, Photos_Schema
from marshmallow import ValidationError
from reviews_website_api.models import Restaurant, Location, Photos
from datetime import datetime
from sqlalchemy import select, update
import os
from werkzeug.utils import secure_filename
import json

@app.route('/')
@app.route('/write-review')
@app.route('/find-review')
def main():
    return app.send_static_file('index.html')

@app.route('/update-review/<name>')
def update_review(name):
    return app.send_static_file('index.html')

@app.route('/photos/<photo>')
def get_photo(photo):
    return send_from_directory(os.environ['FLASK_IMAGE_PATH'], photo)

@app.route('/api/write-review', methods=['POST'])
def new():
    '''Write new review'''
    request_data = None
    # if form data, it's got photos so extract just restaurant and location data and handle photos later
    if request.form:
        str_request_data = json.dumps({'Restaurant': json.loads(request.form['Restaurant']), 'Location': json.loads(request.form['Location'])})
        request_data = json.loads(str_request_data)
    else:
        request_data = request.get_json()
    
    # Validate and deserialize review data
    try:
        data = Review_Schema().load(request_data)
    except ValidationError as err:
        return err.messages, 422
    
    #Check that the restaurant isn't already in database
    restaurant_name = data["Restaurant"]["name"]
    query = select(Restaurant.name).where(Restaurant.name==restaurant_name)
    name = db.session.execute(query).first()
    # If the restaurant isn't in the database, add it to the database
    if name is None:
        restaurant = Restaurant(
            name=restaurant_name,
            website=data["Restaurant"]["website"],
            description=data["Restaurant"]["description"],
            timestamp_created=datetime.now(),
            last_updated=datetime.now(),
            visiting_frequency=data["Restaurant"]["visiting_frequency"],
            tags=data["Restaurant"]["tags"],
            open_late=data["Restaurant"]["open_late"],
            open_early=data["Restaurant"]["open_early"],
            have_i_been=data["Restaurant"]["have_i_been"],
            need_reservation=data["Restaurant"]["need_reservation"],
            good_drinks=data["Restaurant"]["good_drinks"],
            good_desserts=data["Restaurant"]["good_desserts"],
            study_spot=data["Restaurant"]["study_spot"],
            veg_friendly=data["Restaurant"]["veg_friendly"],
            dairy_free_items=data["Restaurant"]["dairy_free_items"],
            quick=data["Restaurant"]["quick"],
            lunch_spot=data["Restaurant"]["lunch_spot"],
            order_online=data["Restaurant"]["order_online"],
            price=data["Restaurant"]["price"],
            dress_attire=data["Restaurant"]["dress_attire"],
            opinion=data["Restaurant"]["opinion"]
        )
        db.session.add(restaurant)
        db.session.commit()

        #once restaurant info is added to the restaurant table, get key so it can be used for adding foreign key for the locaiton table
        key_query = select(Restaurant.restaurant_key).where(Restaurant.name==restaurant_name)
        restaurant_key = db.session.execute(key_query).scalar()

        # add location info to location table
        location = Location(
            restaurant_key=restaurant_key,
            name=restaurant_name,
            address=data["Location"]["address"],
            city=data["Location"]["city"],
            state=data["Location"]["state"],
            zipcode=data["Location"]["zipcode"]
        )
        db.session.add(location)
        db.session.commit()

        # query database for info just submitted to the table
        restaurant_query = select(Restaurant).where(Restaurant.restaurant_key==restaurant_key)
        restaurant_result = Restaurant_Schema().dump(db.session.execute(restaurant_query).first()[0])
        location_query = select(Location).where(Location.restaurant_key==restaurant_key)
        location_result = Location_Schema().dump(db.session.execute(location_query).first()[0])

        # add photos to file table
        # TODO add handling for if it's a duplicate photo
        if request.files:
            uploaded_file = request.files['file']
            for uploaded_file in request.files.getlist('file'):
                filename = secure_filename(uploaded_file.filename)
                if filename != '':
                    file_ext = os.path.splitext(filename)[1]
                    if file_ext not in current_app.config['UPLOAD_EXTENSIONS']:
                        abort(400)
                    filepath = os.path.join(os.environ['FLASK_IMAGE_PATH'], filename)
                    uploaded_file.save(filepath)
                    file = Photos(
                        restaurant_key=restaurant_key,
                        file_link=filename
                    )
                    db.session.add(file)
                    db.session.commit()
            photos_query = select(Photos).where(Photos.restaurant_key==restaurant_key)
            photos_result = Photos_Schema(many=True).dump(db.session.scalars(photos_query).all()) 
            return {"message": f"Review for {name} has been created.", 
                    "Restaurant": restaurant_result, 
                    "Location": location_result, 
                    "Photos": photos_result}
            

        return {"message": f"Review for {name} has been created.", 
                "Restaurant": restaurant_result, 
                "Location": location_result}
    else:
        return {"message": "Restaurant already in database"}, 400

@app.route('/api/find-review', methods=['GET'])
def get_restaurant_name():
    '''When wanting to update a review, get searching criteria and send search results'''
    name = request.args.get("name")
    query = select(Restaurant.name, Restaurant.description, Location.city, Location.state)\
        .select_from(Restaurant)\
        .join(Location, Restaurant.restaurant_key == Location.restaurant_key, isouter=True)\
        .where(Restaurant.name.ilike(f'%{name}%'))
    restaurant_list = Restaurant_Name_List_Schema(many=True)
    result = restaurant_list.dump(db.session.execute(query).fetchmany(5), many=True)
    return {"results": result}

@app.route('/api/update-review/<string:name>', methods=['GET', 'PUT'])
def update_restaurant(name):
    '''Get restaurant info from database and handle when the review is updated in the frontend'''
    if request.method == 'GET':
        # query database for review, search based on restaurant name
        query = select(Restaurant, Location, Photos)\
            .select_from(Restaurant)\
            .join(Location, Restaurant.restaurant_key == Location.restaurant_key, isouter=True)\
            .join(Photos, Restaurant.restaurant_key == Photos.restaurant_key, isouter=True)\
            .where(Restaurant.name == name)
        query_result = db.session.execute(query).all()
        # return review if restaurant name is found
        if query_result is None or len(query_result) == 0:
            return {"message": "Review could not be found."}, 400
        result = Review_Schema().dump({"Restaurant": query_result[0].Restaurant, "Location": query_result[0].Location})
        if query_result[0].Photos is None:
            return {"review": result}
        photos = Photos_Schema(many=True).dump([row.Photos for row in query_result])
        for photo in photos:
            photo['file_link'] = request.url_root + "photos/" + photo['file_link']
        return {"review": result, "photos": photos}
    # when restaurant data is updated, update restaurant data
    else:
        request_data = None
        if request.form:
            str_request_data = json.dumps({'Restaurant': json.loads(request.form['Restaurant']), 'Location': json.loads(request.form['Location'])})
            request_data = json.loads(str_request_data)
        else:
            request_data = request.get_json()

        # Validate and deserialize input
        try:
            data = Review_Schema().load(request_data)
        except ValidationError as err:
            return err.messages, 422
        restaurant_key = data["Restaurant"]["restaurant_key"]
        db.session.execute(update(Restaurant)\
        .where(Restaurant.restaurant_key==restaurant_key)\
        .values(
            {
                Restaurant.name: data["Restaurant"]["name"],
                Restaurant.website: data["Restaurant"]["website"],
                Restaurant.description: data["Restaurant"]["description"],
                Restaurant.last_updated: datetime.now(),
                Restaurant.visiting_frequency: data["Restaurant"]["visiting_frequency"],
                Restaurant.tags: data["Restaurant"]["tags"],
                Restaurant.open_late: data["Restaurant"]["open_late"],
                Restaurant.open_early: data["Restaurant"]["open_early"],
                Restaurant.have_i_been: data["Restaurant"]["have_i_been"],
                Restaurant.need_reservation: data["Restaurant"]["need_reservation"],
                Restaurant.good_drinks: data["Restaurant"]["good_drinks"],
                Restaurant.good_desserts: data["Restaurant"]["good_desserts"],
                Restaurant.study_spot: data["Restaurant"]["study_spot"],
                Restaurant.veg_friendly: data["Restaurant"]["veg_friendly"],
                Restaurant.dairy_free_items: data["Restaurant"]["dairy_free_items"],
                Restaurant.quick: data["Restaurant"]["quick"],
                Restaurant.lunch_spot: data["Restaurant"]["lunch_spot"],
                Restaurant.order_online: data["Restaurant"]["order_online"],
                Restaurant.price: data["Restaurant"]["price"],
                Restaurant.dress_attire: data["Restaurant"]["dress_attire"],
                Restaurant.opinion: data["Restaurant"]["opinion"]
            }  
        ))
        db.session.commit()
            
        location = db.session.execute(select(Location).where(Location.restaurant_key==restaurant_key)).first()
        # want to be able to have a pathway in the scenario when adding the location failed when the review is originally written
        if location is None:
            location = Location(
                restaurant_key=restaurant_key,
                name=data["Restaurant"]["name"],
                address=data["Location"]["address"],
                city=data["Location"]["city"],
                state=data["Location"]["state"],
                zipcode=data["Location"]["zipcode"]
            )
            db.session.add(location)
        else:
            db.session.execute(update(Location)\
            .where(Location.restaurant_key==restaurant_key)\
            .values(
                {
                    Location.name: data["Restaurant"]["name"],
                    Location.address: data["Location"]["address"],
                    Location.city:data["Location"]["city"],
                    Location.state: data["Location"]["state"],
                    Location.zipcode: data["Location"]["zipcode"]
                }
            ))
        db.session.commit()

        restaurant_query = select(Restaurant).where(Restaurant.restaurant_key==restaurant_key)
        restaurant_result = Restaurant_Schema().dump(db.session.execute(restaurant_query).first()[0])
        location_query = select(Location).where(Location.restaurant_key==restaurant_key)
        location_result = Location_Schema().dump(db.session.execute(location_query).first()[0])

        # add photos to file table
        if request.files:
            uploaded_file = request.files['file']
            for uploaded_file in request.files.getlist('file'):
                filename = secure_filename(uploaded_file.filename)
                if filename != '':
                    file_ext = os.path.splitext(filename)[1]
                    if file_ext not in current_app.config['UPLOAD_EXTENSIONS']:
                        abort(400)
                    filepath = os.path.join(os.environ['FLASK_IMAGE_PATH'], filename)
                    uploaded_file.save(filepath)
                    file = Photos(
                        restaurant_key=restaurant_key,
                        file_link=filename
                    )
                    db.session.add(file)
                    db.session.commit()
            photos_query = select(Photos).where(Photos.restaurant_key==restaurant_key)
            photos_result = Photos_Schema(many=True).dump(db.session.scalars(photos_query).all()) 
            return {"message": f"Review for {name} has been updated.", 
                    "Restaurant": restaurant_result, 
                    "Location": location_result, 
                    "Photos": photos_result}
            
        return {"message": f"Review for {data["Restaurant"]["name"]} has been updated.", "Restaurant": restaurant_result, "Location": location_result}
    

if __name__ == "__main__":
     app.run(debug=True ,port=5000,use_reloader=True)
#k1b_PwtezK8BGRgDvIYh