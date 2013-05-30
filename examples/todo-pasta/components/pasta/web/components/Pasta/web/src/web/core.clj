(ns web.core
  (use web.index)
  (require [hiccup.util :as hu])
  (:gen-class))

(defn -main
  [& args]
  (spit "index.html" (str "<!DOCTYPE html>"
                          (main-html)
                          "<!--"
                          (hu/escape-html (slurp "src/web/index.clj"))
                          "-->")))
