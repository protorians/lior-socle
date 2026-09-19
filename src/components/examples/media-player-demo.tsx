"use client"

import {MediaPlayer} from "@liorian/sdk/presentation/ui/media-player";

/** Banc d'essai visuel du MediaPlayer : les trois apparences + un flux HLS. */
export function MediaPlayerDemo() {
    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
            <section className="space-y-3">
                <h2 className="text-sm font-semibold">Note vocale (WhatsApp)</h2>
                <MediaPlayer
                    src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                    variant="voice-note"
                    label="Note vocale de démonstration"
                />
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold">Lecteur audio traditionnel</h2>
                <MediaPlayer
                    src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
                    variant="audio"
                    label="SoundHelix — Song 2"
                />
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold">Lecteur vidéo (YouTube)</h2>
                <MediaPlayer
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    variant="video"
                    label="Big Buck Bunny"
                />
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold">Flux live HLS</h2>
                <MediaPlayer
                    src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                    variant="video"
                    label="Flux HLS de test"
                />
            </section>
        </div>
    );
}
