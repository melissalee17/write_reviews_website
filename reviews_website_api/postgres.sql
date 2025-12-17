create type price_range as enum ('$0-10', '$10-20', '$20-30', '$30-50', '$50-100', '$100+');

create type dress_code as enum ('casual', 'somewhat formal', 'formal');

create table restaurant (
    restaurant_key integer,
    name varchar(50),
    website text,
    description text,
    timestamp_created timestamp with time zone,
    last_updated timestamp with time zone,
    location_key integer,
    visiting freqency varchar(30),
    tags text,
    open_late boolean,
    open_early boolean, 
    have_i_been boolean,
    need_reservation boolean,
    good_drinks boolean,
    study_spot boolean, 
    veg_friendly boolean,
    dairy_free_items boolean,
    quick boolean,
    lunch_spot boolean,
    order_online boolean,
    price price_range,
    dress_attire dress_code,
    opinion text
);

create table location (
    location_key integer,
    restaurant_key integer,
    name varchar(50),
    address text,
    city varchar(20),
    state varchar(20),
    zipcode integer
);

create table photos (
    file_key integer,
    restaurant_key integer,
    file_link text,
    photo_description text
);