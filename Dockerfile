FROM docker.elastic.co/logstash/logstash:8.0.0-alpha2-arm64

COPY QUOTE.csv ./
COPY logstash-csv.conf ./