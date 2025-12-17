from marshmallow import Schema, fields

class Restaurant_Schema(Schema):
    restaurant_key = fields.Int()
    name = fields.Str(required=True)
    website = fields.Url(allow_none=True)
    description = fields.Str(allow_none=True)
    timestamp_created = fields.DateTime()
    last_updated = fields.DateTime()
    visiting_frequency = fields.Str(allow_none=True)
    tags = fields.Str(allow_none=True)
    open_late = fields.Bool()
    open_early = fields.Bool()
    have_i_been = fields.Bool()
    need_reservation = fields.Bool()
    good_drinks = fields.Bool()
    good_desserts = fields.Bool()
    study_spot = fields.Bool()
    veg_friendly = fields.Bool()
    dairy_free_items = fields.Bool()
    quick = fields.Bool()
    lunch_spot = fields.Bool()
    order_online = fields.Bool()
    price = fields.Str()
    dress_attire = fields.Str()
    opinion = fields.Str(allow_none=True)

class Location_Schema(Schema):
    location_key = fields.Int()
    address = fields.Str(allow_none=True)
    city = fields.Str(required=True)
    state = fields.Str(required=True)
    zipcode = fields.Int(allow_none=True, load_default=None)

class Photos_Schema(Schema):
    file_key = fields.Int()
    file_link = fields.Str(required=True)
    photo_description = fields.Str(allow_none=True)


# TODO add ability to have multiple locations and update database the include neighborhood field and hours
    

class Review_Schema(Schema):
    Restaurant = fields.Nested(Restaurant_Schema)
    Location = fields.Nested(Location_Schema)

class Restaurant_Name_List_Schema(Schema):
    name = fields.Str()
    description = fields.Str()
    address = fields.Str(allow_none=True)
    city = fields.Str()
    state = fields.Str()