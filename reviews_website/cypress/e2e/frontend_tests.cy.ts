import { add, rest } from "../../node_modules/cypress/types/lodash/index"

describe("testing the frontend", () => {
    beforeEach(() => {
    cy.visit("/")
  })
    context.skip("test navigation", () => {
        it("tests the NavBar", () => {
            cy.get('#write-review').click()
            cy.location("pathname").should("equal", "/write-review")
            cy.get('#update-review').click()
            cy.location("pathname").should("equal", "/find-review")
            cy.get("#home").click()
            cy.location("pathname").should("equal", "/")
        })
        it("tests url navigation", () => {
            cy.visit('/write-review')
            cy.location("pathname").should("equal", "/write-review")
            cy.visit('/find-review')
            cy.location("pathname").should("equal", '/find-review')
            cy.visit('/update-review/Uchi')
            cy.location("pathname").should("eq", "/update-review/Uchi")
        })
    })

    context.skip("test writing review", () => {
        it("test submitting an empty review", () => {
            cy.get('#write-review').click()
            cy.location("pathname").should("equal", "/write-review")
            cy.get('h1').contains("Write Review")
            cy.get('button').contains('Submit').click()
            cy.get('[role=alert]').contains("No restaurant name given")
        })
        it.skip("test submitting a review with just restaurant name", () => {
            const restaurant_name = ''
            cy.get("#write-review").click()
            cy.location("pathname").should("equal", "/write-review")
            cy.get('h1').contains("Write Review")
            cy.get('#restaurantName').type(restaurant_name)
            cy.get('button').contains('Submit').click()
        })
        it("test submitting a review of a restaurant already in the database", () => {
            cy.intercept('**/api/write-review').as('write_review')
            const restaurant_name = 'Yanagi'
            cy.get("#write-review").click()
            cy.location("pathname").should("equal", "/write-review")
            cy.get('h1').contains("Write Review")
            cy.get('#restaurantName').type(restaurant_name)
            cy.get('button').contains('Submit').click()
            cy.wait('@write_review').then(interception => {
                expect(interception.response.statusCode).to.eq(400)
            })
            cy.get('[role=alert]').contains("Restaurant already in database")
        })
        it.skip("test writing an entire review", () => {
            cy.intercept('**/api/write-review').as('write-review')
            const restaurant_name = 'Evangeline Cafe'
            const website = 'https://evangelinecafe.net/'
            const address = '8106 Brodie Ln'
            const city = 'Austin'
            const state = 'Texas'
            const zipcode = '78745'
            const description = 'Cajun food'
            const frequency = 'Occasionally'
            const price = '$20-30'
            const opinion = 'Don\'t know too much aboutt Cajun/Creole food so I have no idea how authentic this is but I love this place. \
            I normally get jambalaya because I like rice dishes and my dad used to make me jambalaya growing up so it\'s a bit of a comfort \
            food for me. The seafood gumbo is really good as well. Make sure to save room for desserts because the pecan prailine pistolette is solid.'
            cy.get("#write-review").click()
            cy.location("pathname").should("equal", "/write-review")
            cy.get('h1').contains("Write Review")
            cy.get('#restaurantName').type(restaurant_name)
            cy.get('#website').type(website)
            cy.get('#address').type(address)
            cy.get('#city').type(city)
            cy.get('#state').select(state)
            cy.get('#zipcode').type(zipcode)
            cy.get('#whatTheyDo').type(description)
            cy.get('#howOftenIGo').type(frequency)
            cy.get('#haveIBeen').click()
            cy.get('#goodDesserts').click()
            cy.get('#lunchSpot').click()
            cy.get('#priceRange').select(price)
            cy.get('#opinion').type(opinion)
            cy.get('button').contains('Submit').click()
            cy.wait('@write-review').then(interception => {
                expect(interception.response.statusCode).to.eq(200)
                expect(interception.response.body.restaurant.name).to.eq(restaurant_name)
                expect(interception.response.body.location.address).to.eq(address)
                expect(interception.response.body.location.zipcode).to.eq(Number(zipcode))
                expect(interception.response.body.restaurant.price).to.eq(price)
                expect(interception.response.body.restaurant.good_desserts).to.be.true
            })
            cy.location('pathname').should('equal', '/')
            cy.get('[role=alert]').contains(restaurant_name)
        })
    })

    context.skip("test searching for reviews", () => {
        beforeEach(() => {
            cy.visit('/find-review')
        })
        it("checks that everything is on the page", () => {
            cy.get('h1').contains('Search For Review')
            cy.get('.InputField').find('label').contains('Restaurant Name')
            cy.get('.InputField').find('input').should('have.prop', 'placeholder', 'Search Restaurant Name')
            cy.get('form').next().contains('There are no results.')
        })
        it('checks the results', () => {
            cy.intercept('**/api/find-review*').as('search')
            cy.get('input').type('a')
            cy.wait('@search').then(intercept => {
                expect(intercept.response.statusCode).to.eq(200)
                cy.get('a').get('.stretched-link').its('length').should('eq', intercept.response.body.results.length)
            })
        })
        it('checks for scenario when there\'s no results', () => {
            cy.intercept('**/api/find-review*').as('search')
            cy.get('input').type('q')
            cy.wait('@search').then(intercept => {
                expect(intercept.response.statusCode).to.eq(200)
                expect(intercept.response.body.results.length).to.eq(0)
                cy.get('a').get('stretched-link').should('not.exist')
                cy.get('p').contains('There are no results.')
            })
        })
        it('tests empty string', () => {
            cy.intercept('**/api/find-review*').as('search')
            cy.get('input').type(' ')
            cy.wait('@search').then(intercept => {
                expect(intercept.response.statusCode).to.eq(200)
                cy.get('a').get('.stretched-link').its('length').should('eq', intercept.response.body.results.length)
            })
        })
        it('tests selecting a card', () => {
            cy.intercept('**/api/find-review?name=Central').as('search')
            cy.get('input').type('Central')
            cy.wait('@search').then(intercept => {
                expect(intercept.response.statusCode).to.eq(200)
                cy.get('a').get('.stretched-link').its('length').should('eq', intercept.response.body.results.length)
                cy.get('div').get('.card').click()
            })
            cy.location('pathname').should('eq', '/update-review/Central%20Market')
            cy.get('h1').contains('Update Review')
            cy.get('div').get('[role=alert]').contains('Review Found!')
        })
    })

    context.skip("test updating a review", () => {
        it("tests grabbing the data and making sure it's displayed properly on the page", () => {
            cy.intercept('**/api/update-review/Central%20Market').as('review')
            cy.visit('/update-review/Central%20Market')
            cy.wait('@review').then(intercept => {
                cy.get('h1').contains('Update Review')
                cy.get('[role=alert]').contains('Review Found!')
                cy.get('#restaurantName').invoke('val').should('eq', intercept.response.body.review.Restaurant.name)
            })
        })

        it("tests changing the restaurant name to empty string", () => {
            cy.visit('/update-review/Central%20Market')
            cy.get('[role=alert]').should('exist')
            cy.get('#restaurantName').type('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}')
            cy.get('button').contains('Update').click()
            cy.get('div[role=alert]').contains('No restaurant name given')
        })

        it("tests updating the review", () => {
            cy.fixture('Yanagi.json').as('yanagi')
            cy.intercept('PUT', '**/api/update-review/Yanagi').as('update-review')
            cy.visit('update-review/Yanagi')
            cy.get('#website').type('https://yanagitx.com/')
            cy.get('#address').type('4404 W William Cannon Dr')
            cy.get('#city').type('Austin')
            cy.get('#state').invoke('val').should('eq', 'Texas')
            cy.get('#zipcode').type('78749')
            cy.get('#whatTheyDo').type('Solid Casual Japanese/Korean Place')
            cy.get('#howOftenIGo').type('Occasionally')
            cy.get('#haveIBeen').click()
            cy.get('#lactoseIntoleranceFriendly').click()
            cy.get('#lunchSpot').click()
            cy.get('#priceRange').select('$20-30')
            cy.get('#opinion').type('A Japanese mom and pop with Korean owners which is why there\'s japchae on the menu. If you\'re looking for good sushi for not too crazy of a price point, I would recommend this place. I like to come here when I\'m craving udon.')
            cy.get('button').contains('Update').click()
            cy.wait('@update-review').then(intercept => {
                expect(intercept.response.body).to.deep.equal('@yanagi')
                cy.location('pathname').should('eq', '/')
                cy.get('div[role=alert]').contains('Yanagi')
            })
        })
    })
})