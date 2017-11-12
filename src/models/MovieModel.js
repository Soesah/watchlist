import BaseModel from 'core/models/BaseModel';

class Movie extends BaseModel {

  constructor ({imdbId = null, name = null, year = null, score = null, actors = [], length = null, plot = null, director = null, watched = false, date_added = null}) {
    super();
    this.type = 0;
    this.imdbId = imdbId;
    this.name = name;
    this.year = year;
    this.score = score;
    this.actors = actors;
    this.length = length;
    this.plot = plot;
    this.director = director;
    this.watched = watched;
    this.date_added = date_added;
  }

  isComplete () {
    return this.name && this.year && this.length !== 'N\/A';
  }

}