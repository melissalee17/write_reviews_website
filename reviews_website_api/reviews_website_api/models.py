from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, WriteOnlyMapped
from reviews_website_api.app import db 
from datetime import datetime
import enum

class Restaurant(db.Model):
    __tablename__ = 'restaurant'
    
    restaurant_key: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    website: Mapped[str | None]
    description: Mapped[str | None]
    timestamp_created: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    visiting_frequency: Mapped[str | None] = mapped_column(String(30))
    tags: Mapped[str | None] 
    open_late: Mapped[bool] = mapped_column(default=False)
    open_early: Mapped[bool] = mapped_column(default=False)
    have_i_been: Mapped[bool] = mapped_column(default=False)
    need_reservation: Mapped[bool] = mapped_column(default=False)
    good_drinks: Mapped[bool] = mapped_column(default=False)
    good_desserts: Mapped[bool] = mapped_column(default=False)
    study_spot: Mapped[bool] = mapped_column(default=False)
    veg_friendly: Mapped[bool] = mapped_column(default=False)
    dairy_free_items: Mapped[bool] = mapped_column(default=False)
    quick: Mapped[bool] = mapped_column(default=False)
    lunch_spot: Mapped[bool] = mapped_column(default=False)
    order_online: Mapped[bool] = mapped_column(default=False)
    price: Mapped[str]
    dress_attire: Mapped[str]
    opinion: Mapped[str | None]

    def __repr__(self):
        return f'Restaurant: {self.name}'

class Location(db.Model):
    __tablename__ = 'location'

    location_key: Mapped[int] = mapped_column(primary_key=True)
    restaurant_key: Mapped[int] = mapped_column(ForeignKey(Restaurant.restaurant_key))
    name: Mapped[str] = mapped_column(String(50), ForeignKey(Restaurant.name))
    address: Mapped[str | None]
    city: Mapped[str] = mapped_column(String(20), nullable=False)
    state: Mapped[str] = mapped_column(String(20), nullable=False)
    zipcode: Mapped[int | None]

    def __repr__(self):
        return f'{self.name} Location: {self.address} {self.city},{self.state} {self.zipcode}'

class Photos(db.Model):
    __tablename__ = 'photos'

    file_key: Mapped[int] = mapped_column(primary_key=True)
    restaurant_key: Mapped[int] = mapped_column(ForeignKey(Restaurant.restaurant_key))
    file_link: Mapped[str] = mapped_column(unique=True, nullable=False)
    photo_description: Mapped[str | None]

    def __repr__(self):
        return f'File Link: {self.file_link}'