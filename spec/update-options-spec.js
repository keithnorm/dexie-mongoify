describe('update options', function() {

    describe('upsert', function() {

        it('it should insert new document if there is nothing to update', function(done) {
            var query = { firstname: 'Robert' };
            var updates = { $set: { lastname: 'Martin' } };

            db.collection('people').update(query, updates, { upsert: true }).then(function(result) {

                expect(result.result).toBeObject();
                expect(result.modifiedCount).toBe(0);
                expect(result.upsertedCount).toBe(1);
                expect(result.upsertedId).toBeGreaterThan(0);
                return db.collection('people').findOne(query);

            }).then(function(person) {

                expect(person.firstname).toBe('Robert');
                expect(person.lastname).toBe('Martin');
                done();

            });

        });

        it('it should work like plain .update(...) if there is something to update', function(done) {
            var query = { firstname: 'John' };
            var updates = { $set: { lastname: 'Smith' } };

            db.collection('people').update(query, updates, { upsert: true }).then(function(result) {

                expect(result.result).toBeObject();
                expect(result.modifiedCount).toBeGreaterThan(0);
                expect(result.upsertedCount).toBe(0);
                expect(result.upsertedId).toBe(null);
                return db.collection('people').findOne({ firstname: 'John', lastname: 'Smith' });

            }).then(function(person) {

                expect(person.firstname).toBe('John');
                expect(person.lastname).toBe('Smith');
                done();

            });

        });

    });

});
