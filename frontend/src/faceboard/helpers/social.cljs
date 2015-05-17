(ns faceboard.helpers.social
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [cuerdas.core :as str]
            [goog.Uri]))

(def known-icons
  ["adn" "android" "angellist" "apple"
   "behance" "behance-square" "bitbucket" "bitbucket-square" "bitcoin" "btc" "buysellads"
   "cc-amex" "cc-discover" "cc-mastercard" "cc-paypal" "cc-stripe" "cc-visa" "codepen" "connectdevelop" "css3"
   "dashcube" "delicious" "deviantart" "digg" "dribbble" "dropbox" "drupal"
   "empire"
   "facebook" "facebook-official" "facebook-square" "flickr" "forumbee" "foursquare"
   "ge" "git" "git-square" "github" "github-alt" "github-square" "gittip" "google" "google-plus" "google-plus-square" "google-wallet" "gratipay"
   "hacker-news" "html5"
   "instagram" "ioxhost"
   "joomla" "jsfiddle"
   "lastfm" "lastfm-square" "leanpub" "linkedin" "linkedin-square" "linux"
   "maxcdn" "meanpath" "medium"
   "openid"
   "pagelines" "paypal" "pied-piper" "pied-piper-alt" "pinterest" "pinterest-p" "pinterest-square"
   "qq"
   "ra" "rebel" "reddit" "reddit-square" "renren"
   "sellsy" "share-alt" "share-alt-square" "shirtsinbulk" "simplybuilt" "skyatlas" "skype" "slack" "slideshare" "soundcloud" "spotify" "stack-exchange" "stack-overflow" "steam" "steam-square" "stumbleupon" "stumbleupon-circle"
   "tencent-weibo" "trello" "tumblr" "tumblr-square" "twitch" "twitter" "twitter-square"
   "viacoin" "vimeo-square" "vine" "vk"
   "wechat" "weibo" "weixin" "whatsapp" "windows" "wordpress"
   "xing" "xing-square"
   "yahoo" "yelp" "youtube" "youtube-play" "youtube-square"])

(defn non-empty [v]
  (if (empty? v) nil v))

(defn parse-domain [url]
  (let [parsed-url (goog.Uri. url)]
    (or
      (non-empty (.getDomain parsed-url))
      (non-empty (.getScheme parsed-url))                   ; support also urls in form skype:someone, bitcoin:address, etc.
      url)))

; some icon names do not map well to second level domains, handle known cases here
(defn special-case-mappings [domain]
  (condp = domain
    "news.ycombinator.com" "hacker-news"
    "plus.google.com" "google-plus"
    "www.last.fm" "lastfm"
    "last.fm" "lastfm"
    nil))

(defn match-known-icon [domain]
  (let [candidates (filter #(= domain %) known-icons)
        sorted (reverse (sort #(compare (count %1) (count %2)) candidates))]
    (first sorted)))

(defn detect-type [url]
  (let [full-domain-name (parse-domain url)
        parts (str/split full-domain-name "\\.")
        second-level-domain (nth parts (- (count parts) 2) (first parts))]
    (or
      (special-case-mappings full-domain-name)
      (match-known-icon second-level-domain))))

(defn social->icon [type]
  (let [prefix-matches (filter #(str/starts-with? % type) known-icons)
        last-match (last prefix-matches)]                   ; last match is usually -square version
    (if last-match
      (str "fa-" last-match)
      "fa-link")))                                          ; generic web icon if no match

(defn social->label [type]
  (str/replace type "-" " "))

(defn social->content [url]
  (str/rstrip url "/"))                                     ; strip trailing slashes

(defn social-info [url]
  (let [type (detect-type url)]
    {:type    type
     :url     url
     :content (social->content url)
     :label   (social->label type)
     :icon    (social->icon type)}))