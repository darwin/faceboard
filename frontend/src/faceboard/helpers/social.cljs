(ns faceboard.helpers.social
  (:require [cuerdas.core :as str]
            [faceboard.logging :refer [log, log-err, log-warn]]))

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

(defn parse-social [data]
  (let [parts (str/split data #"\|" 2)]
    (cond
      (< (count parts) 1) [nil data]
      (< (count parts) 2) [nil (first parts)]
      :else [(str/lower (first parts)) (str/lower (second parts))])))

(defn complete-url [type id]
  ; TODO: add more services
  (condp = type                                             ; recognized urls from id
    "facebook" (str "https://github.com/" id)
    "twitter" (str "https://twitter.com/" id)
    "github" (str "https://github.com/" id)
    "linkedin" (str "https://www.linkedin.com/in/" id)
    "flickr" (str "https://www.flickr.com/people/" id)
    "lastfm" (str "http://www.last.fm/user/" id)
    nil))

(defn social->url [[type id]]
  (if (str/starts-with? id "http")
    id
    (complete-url type id)))

(defn social->icon [[type _]]
  (let [prefix-matches (filter #(str/starts-with? % type) known-icons)
        last-match (last prefix-matches)]                   ; last match is usually -square version
    (if last-match
      (str "fa-" last-match)
      "fa-external-link-square")))                          ; generic web icon if no match

(defn social->label [[type _]]
  (str/replace type "-" " "))

(defn social-info [data]
  (let [item (parse-social data)]
    {:type    (first item)
     :content (second item)
     :label   (social->label item)
     :url     (social->url item)
     :icon    (social->icon item)}))