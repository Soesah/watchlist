import Episode from 'models/EpisodeModel';

class Season {

  constructor ({year = null, nr = 1, episodes = []}) {
    this.year = year;
    this.nr = nr;
    this.episodes = episodes.map(function(data) {
      return new Episode(data);
    });
  }

  getEpisode (imdbId) {
    return _.find(this.episodes, function(item) {
      return item.imdbId === imdbId;
    });
  }

  getEpisodeByNr (nr) {
    return _.find(this.episodes, function(item) {
      return item.nr === nr;
    });
  }

  createEpisode (imdbId, nr, title) {
    return new Episode({
      imdbId: imdbId,
      nr: nr,
      title: title
    });
  }

  insertEpisode (nr, episode) {
    let index = _.findIndex(this.episodes, {nr: nr});
    this.episodes.splice(index + 1, 0, episode);
  }

  toggleWatched () {
    this.episodes.forEach(episode => this.toggleEpisodeWatched(episode));
  }

  toggleEpisodeWatched (episode) {
    episode.toggleWatched();
  }

  get watched () {
    return this.episodes.length > 0 && _.filter(this.episodes, {watched: false}).length === 0;
  }

  clone () {
    return new this.constructor(JSON.parse(JSON.stringify(this)));
  }

}
