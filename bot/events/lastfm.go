/*
Copyright (c) 2016 Qais Patankar

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
