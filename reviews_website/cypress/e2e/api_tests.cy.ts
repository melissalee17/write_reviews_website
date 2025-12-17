describe('test all api endpoints', () => {
  context.skip("/write-review", () => {
    it("write review that isn't in the database", () => {
      cy.fixture('new_review.json').then(myFixture => {
        cy.request(
          {
            method: 'POST',
            url: 'http://localhost:5000/api/write-review',
            body: myFixture,
            headers: {'Content-Type': 'application/json'}
          }
        ).then(
          (response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('restaurant')
            expect(response.body).to.have.property('location')

          }
        )
      })
    })
    it("tries to write review that's already in the database", () => {
      cy.fixture('existing_review_400_test.json').then(myFixture => {
        cy.request(
          {
            method: 'POST',
            url: 'http://localhost:5000/api/write-review',
            body: myFixture,
            headers: {'Content-Type': 'application/json'},
            failOnStatusCode: false
          }
        ).then((response) => {
          expect(response.status).to.eq(400)
          expect(response.body).to.have.property('message', 'Restaurant already in database')
        }
        )
      })
    })
    it("tries to write review only includes city and state but no other location information", () => {
      cy.fixture("new_review_with_city_state.json").then(myFixture => {
        cy.request(
          {
            method: 'POST',
            url: 'http://localhost:5000/api/write-review',
            body: myFixture,
            headers: {'Content-Type': 'application/json'}
          }
        ).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.location.address).to.be.null
          expect(response.body.location.zipcode).to.be.null
        })
      })
    })
    it("sends nothing should get 204 error", () => {
      cy.request(
        {
          method: 'POST',
          url: 'http://localhost:5000/api/write-review',
          body: {},
          headers: {'Content-Type': 'application/json'},
          failOnStatusCode: false
        }
      ).then((response) => {
        expect(response.status).to.eq(204)
      })
    })
    it("tests Validation 422 error", () => {
      cy.fixture("422_validation_error.json").then(myFixture => {
        cy.request(
          {
            method: 'POST',
            url: 'http://localhost:5000/api/write-review',
            body: myFixture,
            headers: {'Content-Type': 'application/json'},
            failOnStatusCode: false
          }
        ).then((response) => {
          expect(response.status).to.eq(422)
        })
      })
    })
  })

  context.skip("/find-review", () => {
    it("send query that should get results", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/find-review?name=i',
          form: true
        }
      ).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.results.length).to.be.within(1,5)
      })
    })
    it("send query that yields no results", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/find-review?name=q'
        }
      ).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body.results.length).to.equal(0)
        expect(response.body.results).to.be.empty
      })
    })
    it("sends empty string not sure what will happen", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/find-review?name='
        }
      ).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.results.length).to.be.within(0,5)
      })
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/find-review'
        }
      ).then(response => {
        expect(response.status).to.eq(200)
      })
    })
  })

  context.skip("/update-reviews the GET calls", () => {
    it("send query that get's results", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/update-review/Radio%20Coffee%20&%20Beer'
        }
      ).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body.review).to.have.property('Restaurant')
        expect(response.body.review).to.have.property('Location')
      })
    })
    it("send query that yields no results", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/update-review/quest',
          failOnStatusCode: false
        }
      ).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.message).to.eq("Review could not be found.")
      })
    })
    it("sends empty string hopefully yields no results", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/update-review/',
          failOnStatusCode: false
        }
      ).then(response => {
        expect(response.status).to.eq(404)
      })
    })
  })

  context("/update-reivews the PUT calls", () => {
    it.skip("successfully updates a review", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/update-review/Radio%20Coffee%20&%20Beer'
        }
      ).then(response => {
        response.body.review.Location.address = '4204 Menchaca Rd'
        response.body.review.Location.zipcode = 78704
        cy.request(
          {
            method: 'PUT',
            url: 'http://localhost:5000/api/update-review/Radio%20Coffee%20&%20Beer',
            body: response.body.review,
            headers: {'Content-Type': 'application/json'}
          }
        ).then(next_response => {
          expect(next_response.status).to.equal(200)
          expect(next_response.body).to.have.property('message')
          expect(next_response.body.location.address).to.equal('4204 Menchaca Rd')
          expect(next_response.body.location.zipcode).to.equal(78704)
        })
      })
    })
    it.skip("validation error 422", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/update-review/Uchi',
        }
      ).then(response => {
        response.body.review.Location.zipcode = "abc"
        cy.request(
          {
            method: 'PUT',
            url: 'http://localhost:5000/api/update-review/Uchi',
            body: response.body.review,
            headers: {'Content-Type': 'application/json'},
            failOnStatusCode: false
          }
        ).then(next_response => {
          expect(next_response.status).to.eq(422)
        })
      })
    })
    it("send nothing should get 204 error", () => {
      cy.request(
        {
          method: 'PUT',
          url: 'http://localhost:5000/api/update-review/Uchi',
          body: {},
          headers: {'Content-Type': 'application/json'}
        }
      ).then(response => {
        expect(response.status).to.eq(204)
      })
    })
    it("update restaurant name, make sure it propagates correctly to location and restaurant table", () => {
      cy.request(
        {
          method: 'GET',
          url: 'http://localhost:5000/api/update-review/DEE%20DEE'
        }
      ).then(response => {
        response.body.review.Restaurant.name = 'DEE DEE : Farm-to-Table Northeastern Thai Food'
        cy.request(
          {
            method: 'PUT',
            url: 'http://localhost:5000/api/update-review/DEE%20DEE',
            body: response.body.review,
            headers: {'Content-Type': 'application/json'}
          }
        ).then(new_response => {
          expect(new_response.status).to.eq(200)
          expect(new_response.body.restaurant.name).to.eq('DEE DEE : Farm-to-Table Northeastern Thai Food')
        })
      })
    })
  })
})