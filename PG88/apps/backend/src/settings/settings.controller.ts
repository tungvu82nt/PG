import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/create-banner.dto';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // --- PUBLIC ENDPOINTS ---
  @Get('banners')
  @ApiOperation({ summary: 'Get public banners' })
  getPublicBanners() {
    return this.settingsService.findAllBanners(false);
  }

  @Get('announcements')
  @ApiOperation({ summary: 'Get public announcements' })
  getPublicAnnouncements() {
    return this.settingsService.findAllAnnouncements(false);
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system settings' })
  getSystemSettings() {
      // Maybe some public settings? For now allow all for dev?
      // Or restrict? Let's keep strict for now, public only gets what's needed.
      // Actually client usually needs some config.
      // But let's verify what client needs.
      return { maintenance: false }; // Mock
  }


  // --- ADMIN ENDPOINTS ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/banners')
  @ApiOperation({ summary: 'Get all banners (Admin)' })
  getAdminBanners() {
    return this.settingsService.findAllBanners(true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/banners')
  @ApiOperation({ summary: 'Create banner' })
  createBanner(@Body() dto: CreateBannerDto) {
    return this.settingsService.createBanner(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/banners/:id')
  @ApiOperation({ summary: 'Update banner' })
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.settingsService.updateBanner(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/banners/:id')
  @ApiOperation({ summary: 'Delete banner' })
  deleteBanner(@Param('id') id: string) {
    return this.settingsService.deleteBanner(id);
  }

  // --- ANNOUNCEMENTS ADMIN ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/announcements')
  @ApiOperation({ summary: 'Get all announcements (Admin)' })
  getAdminAnnouncements() {
    return this.settingsService.findAllAnnouncements(true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/announcements')
  @ApiOperation({ summary: 'Create announcement' })
  createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.settingsService.createAnnouncement(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/announcements/:id')
  @ApiOperation({ summary: 'Update announcement' })
  updateAnnouncement(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.settingsService.updateAnnouncement(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/announcements/:id')
  @ApiOperation({ summary: 'Delete announcement' })
  deleteAnnouncement(@Param('id') id: string) {
    return this.settingsService.deleteAnnouncement(id);
  }

   // --- SYSTEM settings ADMIN ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/system')
  @ApiOperation({ summary: 'Get all system settings (Admin)' })
  getAllSettings() {
      return this.settingsService.getSettings();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/system')
  @ApiOperation({ summary: 'Update system setting' })
  updateSetting(@Body() body: { key: string; value: any }) {
      return this.settingsService.updateSetting(body.key, body.value);
  }
}
