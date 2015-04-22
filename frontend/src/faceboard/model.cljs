(ns faceboard.model
  (:refer-clojure :exclude [get set update inc dec dissoc])
  (:require [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.helpers.utils :refer [dissoc-path json->model]]))

(defn update
  ([state path fn] (update-in state path fn))
  ([path fn] (update @app-state path fn)))

(defn toggle
  ([state path] (update-in state path #(not %)))
  ([path] (toggle @app-state path)))

(defn toggle-set
  ([state path key] (update-in state path (fn [set]
                                            ;{:pre [(= (type set) "set")]}
                                            (if (contains? set key)
                                              (disj set key)
                                              (conj set key)))))
  ([path key] (toggle-set @app-state path key)))

(defn disable
  ([state path] (assoc-in state path false))
  ([path] (disable @app-state path)))

(defn enable
  ([state path] (assoc-in state path true))
  ([path] (disable @app-state path)))

(defn set
  ([state path value] (assoc-in state path value))
  ([path value] (set @app-state path value)))

(defn get
  ([state path] (get-in state path))
  ([path] (get @app-state path)))

(defn inc
  ([state path] (update state path cljs.core/inc))
  ([path] (inc @app-state path)))

(defn dec
  ([state path]
   (when (zero? (get-in state path))
     (log-err (str "Counter underflow " path)))
   (update state path cljs.core/dec))
  ([path] (dec @app-state path)))

(defn dec-if-pos [n]
  (if (pos? n)
    (cljs.core/dec n)
    n))

(defn dec-clamp-zero
  ([state path] (update state path dec-if-pos))
  ([path] (update @app-state path dec-if-pos)))

(defn- remove-record-with-id [data id]
  (remove #(= (:id %) id) data))

(defn remove-record
  ([state path id] (assoc-in state path (remove-record-with-id (get-in state path) id)))
  ([path id] (remove-record @app-state path id)))

(defn dissoc
  ([state path] (dissoc-path state path))
  ([path] (dissoc @app-state path)))
