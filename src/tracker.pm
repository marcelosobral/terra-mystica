#!/usr/bin/perl -wl

package terra_mystica;

use strict;
use List::Util qw(sum max min);

use vars qw($round @ledger @action_required %leech);

use commands;
use cults;
use factions;
use map;
use resources;
use scoring;
use tiles;
use towns;

our %leech = ();
our @action_required = ();
our @ledger = ();
our $round = 0;

sub finalize {
    for my $faction (@factions) {
        $factions{$faction}{income} = { faction_income $faction };
    }
        
    if ($round > 0) {
        for (0..($round-2)) {
            $tiles{$score_tiles[$_]}->{old} = 1;
        }
        
        current_score_tile->{active} = 1;
    }

    if (@score_tiles) {
        $tiles{$score_tiles[-1]}->{income_display} = '';
    }

    for my $hex (values %map) {
        delete $hex->{adjacent};
        delete $hex->{range};
        delete $hex->{bridge};
    }
    
    for my $faction (@factions) {
        delete $factions{$faction}{locations};
        delete $factions{$faction}{teleport};
        if ($round == 6) {
            delete $factions{$faction}{income};
            delete $factions{$faction}{income_breakdown};
        }
    }

    for my $key (keys %cults) {
        $map{$key} = $cults{$key};
    }

    for my $key (keys %bonus_coins) {
        $map{$key} = $bonus_coins{$key};
        $tiles{$key}{bonus_coins} = $bonus_coins{$key};
    }
}

sub evaluate_game {
    my $data = shift;
    my $row = 1;
    my @error = ();
    my $history_view = 0;

    for (@{$data->{rows}}) {
        eval { handle_row $_ };
        if ($@) {
            chomp;
            push @error, "Error on line $row [$_]:";
            push @error, "$@\n";
            last;
        }
        $row++;

        if (defined $data->{max_row} and $data->{max_row}) {
            my $max = $data->{max_row};
            if (@ledger >= ($max -1)) {
                push @error, "Showing historical game state (up to row $max)";
                $history_view = @ledger;
                last;
            }
        }
    }

    finalize;

    return {
        order => \@factions,
        map => \%map,
        factions => \%factions,
        pool => \%pool,
        bridges => \@bridges,
        ledger => \@ledger,
        error => \@error,
        towns => { map({$_, $tiles{$_}} grep { /^TW/ } keys %tiles ) },
        score_tiles => [ map({$tiles{$_}} @score_tiles ) ],
        bonus_tiles => { map({$_, $tiles{$_}} grep { /^BON/ } keys %tiles ) },
        favors => { map({$_, $tiles{$_}} grep { /^FAV/ } keys %tiles ) },
        action_required => \@action_required,
        history_view => $history_view,
        cults => \%cults,
    }

}

1;
