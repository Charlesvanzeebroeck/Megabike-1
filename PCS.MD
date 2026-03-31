 procyclingstats

stable
 
Search docs
Guide
Examples
API
Scraper
Race
RaceStartlist
RaceClimbs
RaceCombativeRiders
RaceCombativeRiders
Ranking
RiderResults
Rider
Stage
Team
 APIView page source
API
Scraper
classprocyclingstats.scraper.Scraper(url: str, html: str | None = None, update_html: bool = True)
Base class for all scraping classes.

BASE_URL: str= 'https://www.procyclingstats.com/'
__init__(url: str, html: str | None = None, update_html: bool = True)→ None
Creates scraper object that is by default ready for HTML parsing. Call parsing methods to parse data from HTML.

Parameters
:
url – URL of procyclingstats page to parse. Either absolute or relative.

html – HTML to be parsed from, defaults to None. When passing the parameter, set update_html to False to prevent overriding or making useless request.

update_html – Whether to make request to given URL and update self.html. When False self.update_html method has to be called manually to make object ready for parsing. Defaults to True.

Raises
:
ValueError – When given HTML or HTML from given URL is invalid, e.g. ‘Page not found’ is contained in the HTML.

propertyurl: str
Absolute URL from URL that was passed when constructing.

 
propertyhtml: HTMLParser
HTML that is used for parsing.

Raises
:
AttributeError – when HTML is None

relative_url()→ str
Makes relative URL from absolute url (cuts self.BASE_URL from URL).

Returns
:
Relative URL.

update_html()→ None
Calls request to self.url and updates self.html to HTMLParser object created from returned HTML.

fetch_html(url: str)→ HTMLParser
Fetches HTML from given URL and returns it as HTMLParser object.

Parameters
:
url – URL to fetch HTML from.

Returns
:
HTMLParser object created from fetched HTML.

parse(exceptions_to_ignore: ~typing.Tuple[~typing.Type[Exception], ...] = (<class 'procyclingstats.errors.ExpectedParsingError'>,), none_when_unavailable: bool = True)→ Dict[str, Any]
Creates JSON like dict with parsed data by calling all parsing methods. Keys in dict are methods names and values parsed data

Parameters
:
exceptions_to_ignore – Tuple of exceptions that should be ignored when raised by parsing methods. Defaults to (ExpectedParsingError,)

none_when_unavailable – Whether to set dict value to None when method raises ignored exception. When False the key value pair is skipped. Defaults to True.

Returns
:
Dict with parsing methods mapping to parsed data.

Race
classprocyclingstats.race_scraper.Race(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for race overview HTML page.

Usage:

from procyclingstats import Race
race = Race("race/tour-de-france/2022")
race.enddate()
'2022-07-24'
race.parse()
{
    'category': 'Men Elite',
    'edition': 109,
    'enddate': '2022-07-24',
    'is_one_day_race': False,
    ...
}
year()→ int
Parse year when the race occured from HTML.

Returns
:
Year when the race occured.

name()→ str
Parses display name from HTML.

Returns
:
Name of the race, e.g. Tour de France.

is_one_day_race()→ bool
Parses whether race is one day race from HTML.

Returns
:
Whether given race is one day race.

nationality()→ str
Parses race nationality from HTML.

Returns
:
2 chars long country code in uppercase.

edition()→ int
Parses race edition year from HTML.

Returns
:
Edition as int.

startdate()→ str
Parses race startdate from HTML.

Returns
:
Startdate in YYYY-MM-DD format.

enddate()→ str
Parses race enddate from HTML.

Returns
:
Enddate in YYYY-MM-DD format.

category()→ str
Parses race category from HTML.

Returns
:
Race category e.g. Men Elite.

uci_tour()→ str
Parses UCI Tour of the race from HTML.

Returns
:
UCI Tour of the race e.g. UCI Worldtour.

prev_editions_select()→ List[Dict[str, str]]
Parses previous race editions from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

stages(*args: str)→ List[Dict[str, Any]]
Parses race stages from HTML (available only on stage races). When race is one day race, empty list is returned.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

date: Date when the stage occured in MM-DD format.

profile_icon: Profile icon of the stage (p1, p2, … p5).

stage_name: Name of the stage, e.g Stage 2 | Roskilde - Nyborg.

stage_url: URL of the stage, e.g. race/tour-de-france/2022/stage-2.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

stages_winners(*args)→ List[Dict[str, str]]
Parses stages winners from HTML (available only on stage races). When race is one day race, empty list is returned.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

stage_name: Stage name, e.g. Stage 2 (TTT).

rider_name: Winner’s name.

rider_url: Wineer’s URL.

nationality: Winner’s nationality as 2 chars long country code.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

RaceStartlist
classprocyclingstats.race_startlist_scraper.RaceStartlist(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for race startlist HTML page.

Usage:

from procyclingstats import RaceStartlist
race_startlist = RaceStartlist("race/tour-de-france/2022/startlist")
race_startlist.startlist()
[
    {
        'nationality': 'SI',
        'rider_name': 'POGAČAR Tadej',
        'rider_number': 1,
        'rider_url': 'rider/tadej-pogacar',
        'team_name': 'UAE Team Emirates',
        'team_url': 'team/uae-team-emirates-2022'}
    },
    ...
]
race_startlist.parse()
{
    'startlist': [
        {
            'nationality': 'SI',
            'rider_name': 'POGAČAR Tadej',
            'rider_number': 1,
            'rider_url': 'rider/tadej-pogacar',
            'team_name': 'UAE Team Emirates',
            'team_url': 'team/uae-team-emirates-2022'}
        },
        ...
    ]
}
startlist(*args: str)→ List[Dict[str, Any]]
Parses startlist from HTML. When startlist is individual (without teams) fields team name, team url and rider nationality are set to None.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

team_name:

team_url:

nationality: Rider’s nationality as 2 chars long country code.

rider_number: Rider’s ID number in the race. For races without
numbered participants (e.g. the ones that haven’t occured yet) is every rider’s ID None.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

RaceClimbs
classprocyclingstats.race_climbs_scraper.RaceClimbs(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for race climbs HTML page.

Usage:

from procyclingstats import RaceClimbs
race_climbs = RaceClimbs("race/tour-de-france/2022/route/climbs")
race_climbs.climbs()
[
    {
        'climb_name': "Côte d'Asnæs Indelukke",
        'climb_url': 'location/cote-d-asnaes-indelukke',
        'km_before_finnish': 140,
        'length': 1.1,
        'steepness': 5.3,
        'top': 63
    },
    ...
]
race_climbs.parse()
{
    'climbs': [
        {
            'climb_name': " Côte d'Asnæs Indelukke",
            'climb_url': 'location/cote-d-asnaes-indelukke',
            'km_before_finnish': 140,
            'length': 1.1,
            'steepness': 5.3,
            'top': 63
        },
        ...
    ]
}
climbs(*args: str)→ List[Dict[str, Any]]
Parses race’s climbs table from HTML. Note that not allways all info about the climbs is present (usually in older races).

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

climb_name:

climb_url: URL of the location of the climb, NOT the climb itself

length: Length of the climb in KMs.

steepness: Steepness of the climb in %.

top: Height above sea level at the top of the climb in meters.

km_before_finnish: KMs to finnish from the top of the climb.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

RaceCombativeRiders
classprocyclingstats.race_combative_riders_scraper.RaceCombativeRiders(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for combative riders HTML page.

Usage:

from procyclingstats import RaceCombativeRiders
combative = RaceCombativeRiders("race/tour-de-france/2024/results/comative-riders")
combative.combative_riders()
[
    {
        'stage_name': 'Stage 1',
        'stage_url': 'race/tour-de-france/2024/stage-1',
        'rider_name': 'VAN DEN BROEK Frank',
        'rider_url': 'rider/frank-van-den-broek',
        'nationality': 'NL'
    }, 
    ...
}
combative_riders(*args: str)→ List[Dict[str, str]]
Parses combative riders from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

stage_name: Name of the stage, e.g Stage 7 (ITT).

stage_url: URL of the stage, e.g. race/tour-de-france/2022/stage-2.

rider_name:

rider_url:

nationality: Rider’s nationality as 2 chars long country code.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

Ranking
classprocyclingstats.ranking_scraper.Ranking(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for rankings HTML page.

Always only one parsing method that parses ranking is availabe, the others raise ExpectedParsingError. E.g. for object created with example URL would be valid only self.individual_ranking parsing method and others methods that parse ranking (self.team_ranking, …) would raise error.

Usage:

from procyclingstats import Ranking
ranking = Ranking("rankings/me/individual")
ranking.individual_ranking()
[
    {
        'nationality': 'SI',
        'points': 2981.0,
        'prev_rank': 1,
        'rank': 1,
        'rider_name': 'Pogačar Tadej',
        'rider_url': 'rider/tadej-pogacar',
        'team_name': 'UAE Team Emirates',
        'team_url': 'team/uae-team-emirates-2022'
    },
    ...
]
ranking.parse()
{
    'dates_select': [
        {'text': '2022-09-11', 'value': '2022-09-11'},
        {'text': '2021-12-31', 'value': '2021-12-31'},
        {'text': '2019-12-31', 'value': '2019-12-31'},
        ...
    ],
    'distance_ranking': None,
    'individual_ranking': [
        {
            'nationality': 'SI',
            'points': 2981.0,
            'prev_rank': 1,
            'rank': 1,
            'rider_name': 'Pogačar Tadej',
            'rider_url': 'rider/tadej-pogacar',
            'team_name': 'UAE Team Emirates',
            'team_url': 'team/uae-team-emirates-2022'
        },
        ...
    ],
    'individual_wins_ranking': None,
    ...
}
individual_ranking(*args: str)→ List[Dict[str, Any]]
Parses individual ranking from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

team_name:

team_url:

rank: Rider’s rank in the ranking.

prev_rank: Rider’s rank in previous ranking update.

nationality: Rider’s nationality as 2 chars long country code.

points:

Raises
:
ExpectedParsingError – When the table from HTML is not an individual points ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

team_ranking(*args: str)→ List[Dict[str, Any]]
Parses team ranking from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

team_name:

team_url:

rank: Team’s rank in the ranking.

prev_rank: Team’s rank in previous ranking update.

nationality: Team’s nationality as 2 chars long country code.

class: Team’s class, e.g. WT.

points:

Raises
:
ExpectedParsingError – When the table from HTML is not a team points ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

nations_ranking(*args: str)→ List[Dict[str, Any]]
Parses nations ranking from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

nation_name:

nation_url:

rank: Nation’s rank in the ranking.

prev_rank: Nation’s rank in previous ranking update.

nationality: Nation as 2 chars long country code.

points:

Raises
:
ExpectedParsingError – When the table from HTML is not a nationality points ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

races_ranking(*args: str)→ List[Dict[str, Any]]
Parses race ranking from HTML. Race points are evaluated based on
startlist quality score.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

race_name:

race_url:

rank: Race’s rank in the ranking.

prev_rank: Race’s rank in previous ranking update.

nationality: Race’s nationality as 2 chars long country code.

class: Race’s class, e.g. WT.

points:

Raises
:
ExpectedParsingError – When the table from HTML is not a race ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

individual_wins_ranking(*args: str)→ List[Dict[str, Any]]
Parses individual wins ranking from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

team_name:

team_url:

rank: Rider’s rank in the ranking.

prev_rank: Rider’s rank in previous ranking update.

nationality: Rider’s nationality as 2 chars long country code.

first_places:

second_places:

third_places:

Raises
:
ExpectedParsingError – When the table from HTML is not an individual wins ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

teams_wins_ranking(*args: str)→ List[Dict[str, Any]]
Parses team wins ranking from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

team_name:

team_url:

rank: Team’s rank in the ranking.

prev_rank: Team’s rank in previous ranking update.

nationality: Team’s nationality as 2 chars long country code.

class: Team’s class, e.g. WT.

first_places:

second_places:

third_places:

Raises
:
ExpectedParsingError – When the table from HTML is not a team wins ranking.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

nations_wins_ranking(*args: str)→ List[Dict[str, Any]]
Parses nations wins ranking from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

nation_name:

nation_url:

rank: Nation’s rank in the ranking.

prev_rank: Nation’s rank in previous ranking update.

nationality: Nation as 2 chars long country code.

first_places:

second_places:

third_places:

Raises
:
ExpectedParsingError – When the table from HTML is not a nation wins ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

distance_ranking(*args: str)→ List[Dict[str, Any]]
Parses ranking with riders ridden distances from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

team_name:

team_url:

rank: Rider’s rank in the ranking.

nationality: Rider’s nationality as 2 chars long country code.

distance: Rider’s ridden distance in the season as KMs.

Raises
:
ExpectedParsingError – When the table from HTML is not a distance ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

racedays_ranking(*args: str)→ List[Dict[str, Any]]
Parses ranking with riders ridden racedays from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

team_name:

team_url:

rank: Rider’s rank in the ranking.

nationality: Rider’s nationality as 2 chars long country code.

racedays: Rider’s ridden racedays in the season.

Raises
:
ExpectedParsingError – When the table from HTML is not a racedays ranking table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

dates_select()→ List[Dict[str, str]]
Parses dates select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

nations_select()→ List[Dict[str, str]]
Parses nations select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

teams_select()→ List[Dict[str, str]]
Parses teams select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

pages_select()→ List[Dict[str, str]]
Parses pages select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

teamlevels_select()→ List[Dict[str, str]]
Parses team levels select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

RiderResults
classprocyclingstats.rider_results_scraper.RiderResults(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for rider results HTML page.

Supported is besides of default results table also final 5k results table which can be parsed using final_n_km_results method.

Usage:

from procyclingstats import RiderResults
rider_results = RiderResults("rider/alberto-contador/results/final-5k-analysis")
# for normal results table use "rider/alberto-contador/results" URL
rider_results.final_n_km_results()
[
    {
        'average_percentage': 11.8,
        'class': '2.UWT',
        'date': '2017-09-09',
        'nationality': 'ES',
        'rank': 1,
        'stage_name': 'Vuelta a España | Stage 20',
        'stage_url': 'race/vuelta-a-espana/2017/stage-20',
        'vertical_meters': 590},
    },
    ...
]
rider_results.parse()
{
    'categories_select': None,
    'final_n_km_results': [
        {
            'average_percentage': 11.8,
            'class': '2.UWT',
            'date': '2017-09-09',
            'nationality': 'ES',
            'rank': 1,
            'stage_name': 'Vuelta a España | Stage 20',
            'stage_url': 'race/vuelta-a-espana/2017/stage-20',
            'vertical_meters': 590},
        },
        ...
    ],
    'nations_select': None,
    ...
}
results(*args: str)→ List[Dict[str, Any]]
Parses general rider’s results table from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

stage_url:

stage_name:

distance:

nationality: Nationality of the stage race.

date: Date when the stage occured in YYYY-MM-DD format.

rank: Rider’s result in the stage.

class: Class of the stage’s race, e.g. 2.UWT.

pcs_points:

uci_points:

Raises
:
ExpecterParsingError – When the table from HTML isn’t a results table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

final_n_km_results(*args: str)→ List[Dict[str, Any]]
Parses rider’s final n KMs results table from HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

stage_url:

stage_name:

nationality: Nationality of the stage race.

date: Date when the stage occured in YYYY-MM-DD format.

rank: Rider’s result in the stage.

class: Class of the stage’s race, e.g. 2.UWT.

vertical_meters: Vertical meters gained in final n KMs.

average_percentage: Average percentage of last n KMs.

Raises
:
ExpecterParsingError – When the table from HTML isn’t a final n KMs results table.

ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

seasons_select()→ List[Dict[str, str]]
Parses seasons select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

races_select()→ List[Dict[str, str]]
Parses race select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

pages_select()→ List[Dict[str, str]]
Parses race select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

stage_types_select()→ List[Dict[str, str]]
Parses stage types select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

nations_select()→ List[Dict[str, str]]
Parses nations select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

categories_select()→ List[Dict[str, str]]
Parses categories select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

Rider
classprocyclingstats.rider_scraper.Rider(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for rider HTML page.

To parse results from specific season, pass URL with the season, e.g. rider/tadej-pogacar/2021, and use the Rider.results method. But it might be easier to just use the RiderResults scraping class for that purpose.

Usage:

from procyclingstats import Rider
rider = Rider("rider/tadej-pogacar")
rider.birthdate()
'1998-9-21'
rider.parse()
{
    'birthdate': '1998-9-21',
    'height': 1.76,
    'name': 'Tadej  Pogačar',
    'nationality': 'SI',
    ...
}
birthdate()→ str
Parses rider’s birthdate from HTML.

Returns
:
birthday of the rider in YYYY-MM-DD format.

place_of_birth()→ str | None
Parses rider’s place of birth from HTML

Returns
:
rider’s place of birth (town only).

name()→ str
Parses rider’s name from HTML.

Returns
:
Rider’s name.

weight()→ float | None
Parses rider’s weight from HTML.

Returns
:
Rider’s weight in kilograms.

height()→ float | None
Parses rider’s height from HTML.

Returns
:
Rider’s height in meters.

nationality()→ str
Parses rider’s nationality from HTML.

Returns
:
Rider’s current nationality as 2 chars long country code in uppercase.

image_url()→ str | None
Parses URL of rider’s PCS image.

Returns
:
Relative URL of rider’s image. None if image is not available.

teams_history(*args: str)→ List[Dict[str, Any]]
Parses rider’s team history throughout career.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

team_name:

team_url:

season:

class: Team’s class, e.g. WT.

since: First day for rider in current season in the team in MM-DD format, most of the time 01-01.

until: Last day for rider in current season in the team in MM-DD format, most of the time 12-31.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

points_per_season_history(*args: str)→ List[Dict[str, Any]]
Parses rider’s points per season history.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

season:

points: PCS points gained throughout the season.

rank: PCS ranking position after the season.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

points_per_speciality()→ Dict[str, int]
Parses rider’s points per specialty from HTML.

Returns
:
Dict mapping rider’s specialties and points gained. Dict keys: one_day_races, gc, time_trial, sprint, climber, hills

season_results(*args: str)→ List[Dict[str, Any]]
Parses rider’s results from season specified in URL. If no URL is specified, results from current season are parsed.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

result: Rider’s result. None if not rated.

gc_position: GC position after the stage. None if the race is
one day race, after last stage, or if stage is points classification etc…

stage_url:

stage_name:

distance: Distance of the stage, if is given. Otherwise None.

date: Date of the stage in YYYY-MM-DD format. None if the stage
is GC, points classification etc…

pcs_points:

uci_points:

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

Stage
classprocyclingstats.stage_scraper.Stage(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for stage results HTML page.

Usage:

from procyclingstats import Stage
stage = Stage("race/tour-de-france/2022/stage-18")
stage.date()
'2022-07-21'
stage.parse()
{
    'arrival': Hautacam
    'date': '2022-07-21'
    'departure': 'Lourdes'
    'distance': 143.2
    'gc': [
        {
            'age': 25,
            'bonus': 0:00:32,
            'nationality': 'DK',
            'pcs_points': 0,
            'prev_rank': 1,
            'rank': 1,
            'rider_name': 'VINGEGAARD Jonas',
            'rider_url': 'rider/jonas-vingegaard-rasmussen',
            'team_name': 'Jumbo-Visma',
            'team_url': 'team/team-jumbo-visma-2022',
            'time': '71:53:34',
            'uci_points': 25.0
        },
        ...
    ],
    ...
}
is_one_day_race()→ bool
Parses whether race is an one day race from HTML.

Returns
:
Whether the race is an one day race.

distance()→ float
Parses stage distance from HTML.

Returns
:
Stage distance in kms.

profile_icon()→ Literal['p0', 'p1', 'p2', 'p3', 'p4', 'p5']
Parses profile icon from HTML.

Returns
:
Profile icon e.g. p4, the higher the number is the more difficult the profile is.

stage_type()→ Literal['ITT', 'TTT', 'RR']
Parses stage type from HTML.

Returns
:
Stage type, e.g. ITT.

vertical_meters()→ int | None
Parses vertical meters gained throughout the stage from HTML.

Returns
:
Vertical meters.

avg_temperature()→ float | None
Parses average temperature during the stage from the HTML.

Returns
:
Average temperature in degree celsius as float.

date()→ str
Parses date when stage took place from HTML.

Returns
:
Date when stage took place in YYYY-MM-DD format.

departure()→ str
Parses departure of the stage from HTML.

Returns
:
Departure of the stage.

arrival()→ str
Parses arrival of the stage from HTML.

Returns
:
Arrival of the stage.

won_how()→ str
Parses won how string from HTML.

Returns
:
Won how string e.g Sprint of small group.

race_startlist_quality_score()→ Tuple[int, int]
Parses race startlist quality score from HTML.

Returns
:
Tuple of race startlist quality scores. The first element is

race startlist quality score at the beginning of the race and the second one is quality score after current stage.

profile_score()→ int | None
Parses profile score from HTML.

Returns
:
Profile score.

pcs_points_scale()→ str
Parses PCS points scale from HTML.

Returns
:
PCS points scale, e.g. GT.A.Stage.

uci_points_scale()→ str
Parses UCI points scale from HTML.

Returns
:
UCI points scale, e.g. UCI scale. Empty string when not found.

avg_speed_winner()→ float | None
Parses average speed winner from HTML.

Returns
:
avg speed winner, e.g. 44.438.

start_time()→ str
Parses start time from HTML.

Returns
:
start time, e.g. 17:00 (17:00 CET).

race_category()→ str
Parses race category from HTML.

Returns
:
race category, e.g. ME - Men Elite.

climbs(*args: str)→ List[Dict[str, Any]]
Parses listed climbs from the stage. When climbs aren’t listed returns empty list.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

climb_name:

climb_url:

category: Climb category (HC, 1, 2, 3, 4)

rank: List of rider results for the climb, each with:
rider_name

rider_url

rider_number

team_name

team_url

rank

points

age

nationality

pcs_points

uci_points

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

results(*args: str)→ List[Dict[str, Any]]
Parses main results table from HTML. If results table is TTT one day race, fields age and nationality are set to None if are requested, because they aren’t contained in the HTML.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

rider_number:

team_name:

team_url:

rank: Rider’s result in the stage.

status: DF, DNF, DNS, OTL or DSQ.

age: Rider’s age.

nationality: Rider’s nationality as 2 chars long country code.

time: Rider’s time in the stage.

bonus: Bonus seconds in H:MM:SS time format.

pcs_points:

uci_points:

breakaway_kms: How many kilometers has the rider been in
a group before the peloton during the stage.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

gc(*args: str)→ List[Dict[str, Any]]
Parses GC results table from HTML. When GC is unavailable, empty list is returned.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

rider_number:

team_name:

team_url:

rank: Rider’s GC rank after the stage.

prev_rank: Rider’s GC rank before the stage.

age: Rider’s age.

nationality: Rider’s nationality as 2 chars long country code.

time: Rider’s GC time after the stage.

bonus: Bonus seconds that the rider gained throughout the race.

pcs_points:

uci_points:

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

points(*args: str)→ List[Dict[str, Any]]
Parses points classification results table from HTML. When points classif. is unavailable empty list is returned.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

rider_number:

team_name:

team_url:

rank: Rider’s points classif. rank after the stage.

prev_rank: Rider’s points classif. rank before the stage.

points: Rider’s points classif. points after the stage.

age: Rider’s age.

nationality: Rider’s nationality as 2 chars long country code.

pcs_points:

uci_points:

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

kom(*args: str)→ List[Dict[str, Any]]
Parses KOM classification results table from HTML. When KOM classif. is unavailable empty list is returned.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

rider_number:

team_name:

team_url:

rank: Rider’s KOM classif. rank after the stage.

prev_rank: Rider’s KOM classif. rank before the stage.

points: Rider’s KOM points after the stage.

age: Rider’s age.

nationality: Rider’s nationality as 2 chars long country code.

pcs_points:

uci_points:

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

youth(*args: str)→ List[Dict[str, Any]]
Parses youth classification results table from HTML. When youth classif is unavailable empty list is returned.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

rider_name:

rider_url:

rider_number:

team_name:

team_url:

rank: Rider’s youth classif. rank after the stage.

prev_rank: Rider’s youth classif. rank before the stage.

time: Rider’s GC time after the stage.

age: Rider’s age.

nationality: Rider’s nationality as 2 chars long country code.

pcs_points:

uci_points:

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

teams(*args: str)→ List[Dict[str, Any]]
Parses teams classification results table from HTML. When teams classif. is unavailable empty list is returned.

Parameters
:
args –

Fields that should be contained in returned table. When no args are passed, all fields are parsed.

team_name:

team_url:

rank: Teams’s classif. rank after the stage.

prev_rank: Team’s classif. rank before the stage.

time: Team’s total GC time after the stage.

nationality: Team’s nationality as 2 chars long country code.

Raises
:
ValueError – When one of args is of invalid value.

Returns
:
Table with wanted fields.

Team
classprocyclingstats.team_scraper.Team(url: str, html: str | None = None, update_html: bool = True)
Bases: Scraper

Scraper for team HTML page.

Usage:

from procyclingstats import Team
team = Team("team/bora-hansgrohe-2022")
team.abbreviation()
'BOH'
team.parse()
{
    'abbreviation': 'BOH',
    'bike': 'Specialized',
    'history_select': [
        {
            'text': '2027 | BORA - hansgrohe',
            'value': 'team/bora-hansgrohe-2027/overview/'
        },
        ...
    ],
    'name': 'BORA - hansgrohe',
    ...
}
name()→ str
Parses team display name from HTML.

Returns
:
Display name, e.g. BORA - hansgrohe.

nationality()→ str
Parses team’s nationality from HTML.

Returns
:
Team’s nationality as 2 chars long country code in uppercase.

status()→ str
Parses team status (class) from HTML.

Returns
:
Team status as 2 chars long code in uppercase, e.g. WT.

abbreviation()→ str
Parses team abbreviation from HTML.

Returns
:
Team abbreviation as 3 chars long code in uppercase, e.g. BOH

bike()→ str
Parses team’s bike brand from HTML.

Returns
:
Bike brand e.g. Specialized.

license_country()→ str
Parses team’s license country from HTML.

Returns
:
License country name.

wins_count()→ int | None
Parses count of wins in corresponding season from HTML.

Returns
:
Count of wins in corresponding season.

pcs_points()→ int | None
Parses team’s PCS points from HTML.

Returns
:
PCS points gained throughout corresponding year.

pcs_ranking_position()→ int | None
Parses team’s PCS ranking position from HTML.

Returns
:
PCS team ranking position in corresponding year.

uci_ranking_position()→ int | None
Parses team’s UCI ranking position from HTML.

Returns
:
UCI team ranking position in corresponding year.

history_select()→ List[Dict[str, str]]
Parses team seasons select menu from HTML.

Returns
:
Parsed select menu represented as list of dicts with keys text and value.

riders(*args: str)→ List[Dict[str, Any]]
Parses team riders in corresponding season from HTML.

Parameters
:
args – Fields that should be contained in returned table. When no args are passed, all fields are parsed.

Returns
:
Table with wanted fields.

© Copyright 2022, themm1.

Built with Sphinx using a theme provided by Read the Docs.
Read the Docs
 stable