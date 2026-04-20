import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  ButtonComponent,
  CardComponent,
  SessionCardComponent,
  CountdownComponent,
  VoteTallyComponent,
  VoteEntry,
  WinnerRevealComponent,
  AvatarComponent,
  PresenceIndicatorComponent,
  EmptyStateComponent,
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@components';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ButtonComponent,
    CardComponent,
    SessionCardComponent,
    CountdownComponent,
    VoteTallyComponent,
    WinnerRevealComponent,
    AvatarComponent,
    PresenceIndicatorComponent,
    EmptyStateComponent,
  ],
  template: `
    @if (visible()) {
      <div class="gallery">
        <h1 class="gallery__heading">Component Primitives Gallery</h1>

        <!-- 1. Button -->
        <section class="gallery__section">
          <h2>Button</h2>
          <div class="gallery__row">
            <qq-button variant="filled">Filled</qq-button>
            <qq-button variant="tonal">Tonal</qq-button>
            <qq-button variant="text">Text</qq-button>
            <qq-button variant="icon" aria-label="Icon button">★</qq-button>
            <qq-button variant="filled" [disabled]="true">Disabled</qq-button>
          </div>
        </section>

        <!-- 2. Card -->
        <section class="gallery__section">
          <h2>Card</h2>
          <qq-card style="max-width: 320px; padding: 16px;">
            <p style="margin: 0;">This is a projected card body.</p>
          </qq-card>
        </section>

        <!-- 3. Session Card -->
        <section class="gallery__section">
          <h2>Session Card</h2>
          <div class="gallery__row gallery__row--wrap">
            @for (s of sessionStatuses; track s) {
              <qq-session-card [title]="'Session: ' + s" [status]="s" style="min-width: 260px;">
                <span slot="countdown">—</span>
                <qq-button slot="actions" variant="tonal">View</qq-button>
              </qq-session-card>
            }
          </div>
        </section>

        <!-- 4. Countdown -->
        <section class="gallery__section">
          <h2>Countdown</h2>
          <div class="gallery__row">
            <qq-countdown [deadline]="futureDeadline" (ended)="onCountdownEnd()"></qq-countdown>
          </div>
        </section>

        <!-- 5. Vote Tally -->
        <section class="gallery__section">
          <h2>Vote Tally</h2>
          <div style="max-width: 320px;">
            <qq-vote-tally [votes]="voteTallyEntries"></qq-vote-tally>
          </div>
        </section>

        <!-- 6. Winner Reveal -->
        <section class="gallery__section">
          <h2>Winner Reveal</h2>
          <div class="gallery__row">
            <qq-button variant="filled" (click)="triggerReveal()">Reveal Winner</qq-button>
            <qq-winner-reveal #winnerReveal></qq-winner-reveal>
          </div>
        </section>

        <!-- 7. Avatar -->
        <section class="gallery__section">
          <h2>Avatar</h2>
          <div class="gallery__row">
            <qq-avatar name="Quinntyne Brown" size="sm"></qq-avatar>
            <qq-avatar name="Quinntyne Brown" size="md"></qq-avatar>
            <qq-avatar name="Quinntyne Brown" size="lg"></qq-avatar>
            <qq-avatar name="Alice" src="https://i.pravatar.cc/150?img=47" size="md"></qq-avatar>
            <qq-avatar name="Broken Img" src="https://broken-image-url.example" size="md"></qq-avatar>
          </div>
        </section>

        <!-- 8. Presence Indicator -->
        <section class="gallery__section">
          <h2>Presence Indicator</h2>
          <div class="gallery__row">
            <span style="display:flex;align-items:center;gap:8px;">
              <qq-presence-indicator [online]="true"></qq-presence-indicator> Online
            </span>
            <span style="display:flex;align-items:center;gap:8px;">
              <qq-presence-indicator [online]="false"></qq-presence-indicator> Offline
            </span>
          </div>
        </section>

        <!-- 9. Empty State -->
        <section class="gallery__section">
          <h2>Empty State</h2>
          <qq-empty-state
            title="Nothing here yet"
            description="Once sessions are created they'll appear here."
          >
            <span slot="illustration" style="font-size: 3rem;">📭</span>
            <qq-button slot="cta" variant="filled">Get started</qq-button>
          </qq-empty-state>
        </section>

        <!-- 10. Confirm Dialog -->
        <section class="gallery__section">
          <h2>Confirm Dialog</h2>
          <div class="gallery__row">
            <qq-button variant="filled" (click)="openDialog(false)">Open Dialog</qq-button>
            <qq-button variant="filled" (click)="openDialog(true)">Destructive Dialog</qq-button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .gallery {
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
    }

    .gallery__heading {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 40px;
    }

    .gallery__section {
      margin-bottom: 48px;

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 16px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 8px;
      }
    }

    .gallery__row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      &--wrap {
        align-items: flex-start;
      }
    }
  `],
})
export class GalleryPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  readonly visible = signal(false);

  @ViewChild('winnerReveal') winnerReveal!: WinnerRevealComponent;

  readonly voteTallyEntries: VoteEntry[] = [
    { label: 'Option A', votes: 7 },
    { label: 'Option B', votes: 3 },
    { label: 'Empty', votes: 0 },
  ];

  readonly sessionStatuses: Array<'suggesting' | 'voting' | 'decided' | 'cancelled'> = [
    'suggesting',
    'voting',
    'decided',
    'cancelled',
  ];

  readonly futureDeadline = new Date(Date.now() + 5 * 60 * 1000);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.visible.set(params.has('gallery'));
    });
  }

  triggerReveal(): void {
    this.winnerReveal?.reveal('Quinntyne Brown');
  }

  onCountdownEnd(): void {
    console.log('[Gallery] Countdown ended');
  }

  openDialog(destructive: boolean): void {
    const data: ConfirmDialogData = {
      title: destructive ? 'Delete Session' : 'Confirm Action',
      message: destructive
        ? 'This action is irreversible. The session and all its data will be permanently deleted.'
        : 'Are you sure you want to proceed with this action?',
      destructive,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, width: '400px' })
      .afterClosed()
      .subscribe(result => {
        console.log('[Gallery] Dialog result:', result);
      });
  }
}
