package main

import (
	"encoding/json"
	"fmt"
	"github.com/shkh/lastfm-go/lastfm"
	"os"
	"strings"
	"time"
)

type UpdateLastfmData struct {
	Scrobble   lastfm.P `json: "scrobble"`
	NowPlaying lastfm.P `json: "nowPlaying"`
}

func parseTitle(data lastfm.P) (success bool) {
	title, ok := data["title"].(string)
	if !ok {
		fmt.Println("Title does not exist")
		return
	}

	sep := " - "
	artistEnd := strings.Index(title, sep)
	if artistEnd == -1 {
		fmt.Println("Separator missing")
		return
	}

	data["artist"] = title[:artistEnd]
	data["track"] = title[artistEnd+len(sep):]
	success = true
	fmt.Println(data)
	return
}

func main() {
	api := lastfm.New(os.Getenv("LFM_APIKEY"), os.Getenv("LFM_APISECRET"))
	err := api.Login(os.Getenv("LFM_USERNAME"), os.Getenv("LFM_PASSWORD"))
	if err != nil {
		fmt.Println("Error logging in: ", err)
		return
	}

	// trigger this whenever the song updates
	// give in the previous song to finish playing (scrobble)
	// artist
	// track
	// duration
	// give in the next song that is currently being playing (updatenowplaying)
	// artist
	// track
	// duration

	if len(os.Args) != 2 {
		fmt.Println("Expected argument!")
		return
	}

	input := os.Args[1]

	var data UpdateLastfmData
	err = json.Unmarshal([]byte(input), &data)

	if err != nil {
		fmt.Println("Error unmarshaling json: ", err)
		return
	}

	if (data.Scrobble != nil) && parseTitle(data.Scrobble) {
		data.Scrobble["timestamp"] = time.Now().Unix()
		result, err := api.Track.Scrobble(data.Scrobble)
		if err != nil {
			fmt.Println("Error Scrobble", err)
		} else {
			fmt.Println("Scrobble:", result)
		}
	}

	fmt.Println()

	if (data.NowPlaying != nil) && parseTitle(data.NowPlaying) {
		data.NowPlaying["sk"] = api.GetSessionKey()
		result, err := api.Track.UpdateNowPlaying(data.NowPlaying)
		if err != nil {
			fmt.Println("Error UpdateNowPlaying", err)
		} else {
			fmt.Println("UpdateNowPlaying:", result)
		}

	}
}
